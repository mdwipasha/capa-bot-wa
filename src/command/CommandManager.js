/**
 * CommandManager
 * --------------
 * Façade utama untuk seluruh operasi command.
 * Komponen lain (BotManager, Dashboard) hanya boleh berinteraksi
 * dengan command melalui CommandManager — tidak langsung ke folder command.
 *
 * Arsitektur:
 *   Dashboard → REST API → BotManager → CommandManager → CommandRegistry
 *                                                       → CommandLoader
 *                                                       → CommandValidator
 *                                                       → CommandParser
 *                                                       → CooldownManager
 *                                                       → PermissionManager
 *                                                       → HelpGenerator
 *
 * Events yang diterbitkan:
 *   command.loaded    command.unloaded    command.reloaded
 *   command.executed  command.failed      command.enabled
 *   command.disabled  command.registered  command.unregistered
 */

import path from 'path';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import { logger } from '../utils/logger.js';
import { CommandRegistry } from './CommandRegistry.js';
import { CommandLoader } from './CommandLoader.js';
import { CommandValidator } from './CommandValidator.js';
import { CommandParser } from './CommandParser.js';
import { CooldownManager } from './CooldownManager.js';
import { PermissionManager } from './PermissionManager.js';
import { HelpGenerator } from './HelpGenerator.js';

export class CommandManagerError extends Error {
  constructor(message, code = 'COMMAND_MANAGER_ERROR') {
    super(message);
    this.name = 'CommandManagerError';
    this.code = code;
  }
}

export class CommandManager extends EventEmitter {
  /**
   * @param {object} options
   * @param {string} [options.commandsDir='src/commands'] - path folder command
   * @param {string[]} [options.prefixes=['.']] - prefix command
   * @param {string} [options.ownerNumber=''] - nomor owner
   * @param {string} [options.botName='Bot'] - nama bot
   * @param {number} [options.defaultCooldown=3] - cooldown default (detik)
   * @param {boolean} [options.watchEnabled=true] - aktifkan hot-reload watcher
   * @param {import('../manager/EventBus.js').EventBus} [options.eventBus] - shared EventBus
   */
  constructor({
    commandsDir = 'src/commands',
    prefixes = ['.'],
    ownerNumber = '',
    botName = 'Bot',
    defaultCooldown = 3,
    watchEnabled = true,
    eventBus = null
  } = {}) {
    super();
    this.commandsDir = path.resolve(commandsDir);
    this.prefixes = prefixes;
    this.ownerNumber = ownerNumber;
    this.botName = botName;
    this.defaultCooldown = defaultCooldown;
    this.watchEnabled = watchEnabled;
    this.eventBus = eventBus;

    // Inisialisasi layer
    this.validator = new CommandValidator();
    this.registry = new CommandRegistry();
    this.loader = new CommandLoader({ registry: this.registry, validator: this.validator });
    this.cooldown = new CooldownManager();
    this.permission = new PermissionManager({ ownerNumber, registry: this.registry });
    this.parser = new CommandParser({ prefixes });
    this.help = new HelpGenerator({ registry: this.registry, botName, prefix: prefixes[0] || '.' });

    // Bridge loader events ke CommandManager
    this._bridgeLoaderEvents();

    /** Reload callbacks (untuk MessageRouter.clear() dll.) */
    this._reloadCallbacks = [];
  }

  // ─────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────

  /**
   * Load semua command dari folder.
   * @returns {Promise<object[]>} list command yang berhasil di-load
   */
  async loadCommands() {
    logger.info('CommandManager: Loading semua command...');
    await this.loader.loadAll(this.commandsDir);

    if (this.watchEnabled && !this.loader.isWatching()) {
      this.loader.startWatcher(this.commandsDir);
    }

    const commands = this.registry.all();
    this._emit('command.loaded', { total: commands.length });
    logger.success(`CommandManager: ${commands.length} command aktif.`);
    return commands;
  }

  /**
   * Reload semua command (unload + load ulang).
   * @returns {Promise<object[]>}
   */
  async reloadCommands() {
    logger.info('CommandManager: Reloading semua command...');
    await this.loader.unloadAll();
    await this.loader.loadAll(this.commandsDir);

    const commands = this.registry.all();
    this._emit('command.reloaded', { total: commands.length });
    this._triggerReloadCallbacks();
    logger.success(`CommandManager: Reload selesai — ${commands.length} command aktif.`);
    return commands;
  }

  /**
   * Reload satu command by name.
   * @param {string} name
   * @returns {Promise<object>}
   */
  async reloadCommand(name) {
    const entry = this._requireCommand(name);
    const filePath = entry.filePath;

    if (!filePath) {
      throw new CommandManagerError(
        `Command "${name}" tidak memiliki filePath, tidak bisa direload.`,
        'COMMAND_NO_FILEPATH'
      );
    }

    logger.info(`CommandManager: Reloading command "${name}"...`);
    const ok = await this.loader.reloadFile(filePath);

    if (!ok) {
      throw new CommandManagerError(`Gagal reload command "${name}".`, 'COMMAND_RELOAD_FAILED');
    }

    const updated = this.registry.get(name);
    this._emit('command.reloaded', { name, command: updated });
    return updated;
  }

  // ─────────────────────────────────────────────
  // Query
  // ─────────────────────────────────────────────

  /**
   * Ambil semua command (atau untuk bot tertentu).
   * @param {string|null} [botId=null]
   * @returns {object[]}
   */
  getCommands(botId = null) {
    return this.registry.snapshot(botId);
  }

  /**
   * Ambil satu command by name atau alias.
   * @param {string} name
   * @param {string|null} [botId=null]
   * @returns {object|null}
   */
  getCommand(name, botId = null) {
    const entry = this.registry.get(name);
    if (!entry) return null;
    if (entry.enabled === false) return null;
    if (botId && !this.registry.isEnabledForBot(botId, entry.name)) return null;
    return entry;
  }

  /**
   * Find command — alias untuk getCommand dengan fallback ke alias.
   * @param {string} name
   * @param {string|null} [botId=null]
   * @returns {object|null}
   */
  findCommand(name, botId = null) {
    return this.getCommand(name, botId);
  }

  /**
   * Cari command by query (name, alias, category, description, author, tags).
   * @param {string} query
   * @returns {object[]}
   */
  searchCommand(query) {
    return this.registry.search(query).map(({ execute, onLoad, onUnload, onReload, onEnable, onDisable, ...meta }) => ({
      ...meta,
      hasExecute: typeof execute === 'function',
      statistics: this.registry.getStats(meta.name)
    }));
  }

  /**
   * Ambil semua command yang enabled (dengan execute function — untuk handler).
   * @param {string|null} [botId=null]
   * @returns {object[]}
   */
  getEnabledCommands(botId = null) {
    if (botId) {
      return this.registry.allForBot(botId).filter((c) => c.enabledForBot !== false && c.enabled !== false);
    }
    return this.registry.filter((c) => c.enabled !== false && c.status !== 'error');
  }

  // ─────────────────────────────────────────────
  // Enable / Disable
  // ─────────────────────────────────────────────

  /**
   * Enable command secara global.
   * @param {string} name
   * @param {string|null} [botId=null]
   * @returns {object}
   */
  async enableCommand(name, botId = null) {
    const entry = this._requireCommand(name);

    if (botId) {
      const result = this.registry.setPerBot(botId, name, { enabled: true });
      this._emit('command.enabled', { name, botId });
      logger.info(`CommandManager: Command "${name}" diaktifkan untuk bot "${botId}".`);
      return { name, botId, ...result };
    }

    const updated = this.registry.setEnabled(name, true);

    // Run onEnable hook jika ada
    if (entry && typeof entry.onEnable === 'function') {
      try { await entry.onEnable(); } catch (e) { logger.error(`onEnable hook error: ${e.message}`); }
    }

    this._emit('command.enabled', { name });
    this._triggerReloadCallbacks();
    logger.info(`CommandManager: Command "${name}" diaktifkan.`);
    return updated;
  }

  /**
   * Disable command secara global.
   * @param {string} name
   * @param {string|null} [botId=null]
   * @returns {object}
   */
  async disableCommand(name, botId = null) {
    const entry = this._requireCommand(name);

    if (botId) {
      const result = this.registry.setPerBot(botId, name, { enabled: false });
      this._emit('command.disabled', { name, botId });
      logger.info(`CommandManager: Command "${name}" dinonaktifkan untuk bot "${botId}".`);
      return { name, botId, ...result };
    }

    const updated = this.registry.setEnabled(name, false);

    // Run onDisable hook jika ada
    if (entry && typeof entry.onDisable === 'function') {
      try { await entry.onDisable(); } catch (e) { logger.error(`onDisable hook error: ${e.message}`); }
    }

    this._emit('command.disabled', { name });
    this._triggerReloadCallbacks();
    logger.info(`CommandManager: Command "${name}" dinonaktifkan.`);
    return updated;
  }

  // ─────────────────────────────────────────────
  // Per-Group Command Control
  // ─────────────────────────────────────────────

  /**
   * Enable command untuk grup tertentu.
   * @param {string} groupJid
   * @param {string} name
   * @returns {object}
   */
  enableCommandForGroup(groupJid, name) {
    this._requireCommand(name);
    const result = this.registry.setPerGroup(groupJid, name, { enabled: true });
    this._emit('command.enabled', { name, groupJid });
    return { name, groupJid, ...result };
  }

  /**
   * Disable command untuk grup tertentu.
   * @param {string} groupJid
   * @param {string} name
   * @returns {object}
   */
  disableCommandForGroup(groupJid, name) {
    this._requireCommand(name);
    const result = this.registry.setPerGroup(groupJid, name, { enabled: false });
    this._emit('command.disabled', { name, groupJid });
    return { name, groupJid, ...result };
  }

  // ─────────────────────────────────────────────
  // Per-User Config
  // ─────────────────────────────────────────────

  /**
   * Blacklist user dari command.
   * @param {string} userJid
   * @param {string} commandName
   */
  blacklistUser(userJid, commandName) {
    this.registry.setPerUser(userJid, commandName, { blacklisted: true });
  }

  /**
   * Whitelist user untuk command.
   * @param {string} userJid
   * @param {string} commandName
   */
  whitelistUser(userJid, commandName) {
    this.registry.setPerUser(userJid, commandName, { whitelisted: true });
  }

  /**
   * Set user sebagai premium.
   * @param {string} userJid
   * @param {boolean} [premium=true]
   */
  setPremium(userJid, premium = true) {
    this.registry.setPerUser(userJid, '*', { premium });
  }

  /**
   * Set user sebagai VIP.
   * @param {string} userJid
   * @param {boolean} [vip=true]
   */
  setVIP(userJid, vip = true) {
    this.registry.setPerUser(userJid, '*', { vip });
  }

  // ─────────────────────────────────────────────
  // Install / Delete
  // ─────────────────────────────────────────────

  /**
   * Install command baru dari file.
   * @param {object} options
   * @param {string} options.filePath - path sumber file
   * @param {string} [options.category='general'] - subfolder tujuan
   * @param {string} [options.filename] - nama file tujuan
   * @returns {Promise<object|null>}
   */
  async installCommand({ filePath, category = 'general', filename } = {}) {
    if (!filePath) {
      throw new CommandManagerError(
        'installCommand() membutuhkan filePath.',
        'COMMAND_INSTALL_NO_SOURCE'
      );
    }

    const exists = await fs.pathExists(filePath);
    if (!exists) {
      throw new CommandManagerError(`File tidak ditemukan: ${filePath}`, 'COMMAND_FILE_NOT_FOUND');
    }

    const destDir = path.join(this.commandsDir, category);
    await fs.ensureDir(destDir);

    const destFile = path.join(destDir, filename || path.basename(filePath));
    await fs.copy(filePath, destFile, { overwrite: false });

    const ok = await this.loader.loadFile(destFile);
    if (!ok) {
      await fs.remove(destFile).catch(() => {});
      throw new CommandManagerError(`Gagal install command dari "${filePath}".`, 'COMMAND_INSTALL_FAILED');
    }

    const name = [...this.loader.getFileMap().entries()]
      .find(([fp]) => fp === destFile)?.[1];
    const entry = name ? this.registry.get(name) : null;

    this._emit('command.installed', { name, filePath: destFile });
    logger.success(`CommandManager: Command "${name}" berhasil diinstall.`);
    return entry;
  }

  /**
   * Delete command: hapus file fisik + unload dari registry.
   * @param {string} name
   * @returns {Promise<{ ok: boolean }>}
   */
  async deleteCommand(name) {
    const entry = this._requireCommand(name);

    if (!entry.filePath) {
      throw new CommandManagerError(
        `Command "${name}" tidak memiliki filePath, tidak bisa dihapus dari disk.`,
        'COMMAND_NO_FILEPATH'
      );
    }

    // Unload dulu
    await this.loader.unloadFile(entry.filePath);

    // Hapus file fisik
    await fs.remove(entry.filePath);

    this._emit('command.deleted', { name, filePath: entry.filePath });
    logger.info(`CommandManager: Command "${name}" dan file-nya dihapus.`);
    return { ok: true, name };
  }

  // ─────────────────────────────────────────────
  // Register / Unregister (programmatic)
  // ─────────────────────────────────────────────

  /**
   * Register command secara programmatic (tanpa file).
   * @param {object} command - command object dengan name + execute
   * @returns {object}
   */
  registerCommand(command) {
    const quick = this.validator.quickCheck(command);
    if (!quick.valid) {
      throw new CommandManagerError(`Invalid command: ${quick.reason}`, 'COMMAND_INVALID');
    }

    const result = this.validator.validate(command, {
      existingNames: this.registry.names(),
      existingAliases: this.registry.aliasMap()
    });

    const entry = this.registry.set(result.normalized.name, result.normalized);
    this._emit('command.registered', { name: result.normalized.name });
    logger.info(`CommandManager: Command "${result.normalized.name}" registered secara programmatic.`);
    return entry;
  }

  /**
   * Unregister command (hapus dari registry saja, file tidak dihapus).
   * @param {string} name
   * @returns {boolean}
   */
  unregisterCommand(name) {
    const entry = this._requireCommand(name);
    const ok = this.registry.delete(entry.name);
    if (ok) {
      this._emit('command.unregistered', { name: entry.name });
      logger.info(`CommandManager: Command "${entry.name}" unregistered.`);
    }
    return ok;
  }

  // ─────────────────────────────────────────────
  // Statistics
  // ─────────────────────────────────────────────

  /**
   * Ambil statistik semua command.
   * @returns {object[]}
   */
  getStatistics() {
    return this.registry.getAllStats();
  }

  /**
   * Ambil statistik satu command.
   * @param {string} name
   * @returns {object}
   */
  getCommandStats(name) {
    return this.registry.getStats(name);
  }

  /**
   * Ambil command terpopuler.
   * @param {number} [limit=10]
   * @returns {object[]}
   */
  getTopCommands(limit = 10) {
    return this.registry.getTopCommands(limit);
  }

  /**
   * Catat eksekusi command.
   * @param {string} name
   * @param {{ success: boolean, executionTime: number }} result
   */
  recordExecution(name, result) {
    this.registry.recordExecution(name, result);
  }

  // ─────────────────────────────────────────────
  // Help Generation
  // ─────────────────────────────────────────────

  /**
   * Generate menu utama.
   * @param {object} [options]
   * @returns {string}
   */
  getMenu(options = {}) {
    return this.help.generateMenu(options);
  }

  /**
   * Generate help untuk satu command.
   * @param {string} commandName
   * @param {object} [options]
   * @returns {string|null}
   */
  getCommandHelp(commandName, options = {}) {
    return this.help.generateCommandHelp(commandName, options);
  }

  /**
   * Generate menu per kategori.
   * @param {string} category
   * @param {object} [options]
   * @returns {string}
   */
  getCategoryMenu(category, options = {}) {
    return this.help.generateCategoryMenu(category, options);
  }

  // ─────────────────────────────────────────────
  // Parser
  // ─────────────────────────────────────────────

  /**
   * Parse pesan menjadi command context.
   * @param {object} options
   * @returns {object|null}
   */
  parseMessage(options) {
    return this.parser.parse(options);
  }

  // ─────────────────────────────────────────────
  // Permission & Cooldown (delegasi)
  // ─────────────────────────────────────────────

  /**
   * Periksa permission command.
   * @param {object} ctx
   * @returns {Promise<{ allowed: boolean, reason: string|null }>}
   */
  checkPermission(ctx) {
    return this.permission.check(ctx);
  }

  /**
   * Periksa dan set cooldown.
   * @param {object} options
   * @returns {{ allowed: boolean, remainingSec: number }}
   */
  checkCooldown(options) {
    return this.cooldown.check({ defaultCooldown: this.defaultCooldown, ...options });
  }

  // ─────────────────────────────────────────────
  // Watcher Control
  // ─────────────────────────────────────────────

  startWatcher() {
    if (!this.loader.isWatching()) {
      this.loader.startWatcher(this.commandsDir);
    }
  }

  stopWatcher() {
    this.loader.stopWatcher();
  }

  // ─────────────────────────────────────────────
  // Reload Callback (Backward Compat)
  // ─────────────────────────────────────────────

  /**
   * Register callback yang dipanggil setiap kali ada perubahan command.
   * Digunakan oleh MessageRouter untuk clear handler cache.
   * @param {function} callback
   */
  onReload(callback) {
    if (typeof callback === 'function') {
      this._reloadCallbacks.push(callback);
      // Juga daftarkan ke loader
      this.loader.onReload(callback);
    }
  }

  /**
   * Panggil semua reload callbacks.
   * @private
   */
  _triggerReloadCallbacks() {
    for (const cb of this._reloadCallbacks) {
      try { cb(); } catch (err) {
        logger.error(`CommandManager: Reload callback error — ${err.message}`);
      }
    }
  }

  // ─────────────────────────────────────────────
  // Count
  // ─────────────────────────────────────────────

  /**
   * Jumlah command yang terdaftar.
   * @returns {number}
   */
  count() {
    return this.registry.size();
  }

  // ─────────────────────────────────────────────
  // Backward Compat: CommandLoader adapter API
  // (untuk MessageRouter & commandHandler yang pakai loader.get / loader.list)
  // ─────────────────────────────────────────────

  /**
   * Ambil command by name (backward compat dengan CommandLoader.get()).
   * @param {string} name
   * @param {string|null} [botId=null]
   * @returns {object|null}
   */
  get(name, botId = null) {
    return this.getCommand(name, botId);
  }

  /**
   * List semua command yang enabled (backward compat dengan CommandLoader.list()).
   * @param {string|null} [botId=null]
   * @returns {object[]}
   */
  list(botId = null) {
    return this.getEnabledCommands(botId);
  }

  // ─────────────────────────────────────────────
  // Internal Helpers
  // ─────────────────────────────────────────────

  /**
   * Require command ada di registry. Lempar error jika tidak.
   * @param {string} name
   * @returns {object}
   */
  _requireCommand(name) {
    const entry = this.registry.get(name);
    if (!entry) {
      throw new CommandManagerError(`Command "${name}" tidak ditemukan.`, 'COMMAND_NOT_FOUND');
    }
    return entry;
  }

  /**
   * Emit event ke internal EventEmitter DAN shared EventBus (jika ada).
   * @param {string} event
   * @param {object} payload
   * @private
   */
  _emit(event, payload = {}) {
    this.emit(event, { event, timestamp: new Date().toISOString(), ...payload });
    this.eventBus?.emitEvent?.(event, payload);
  }

  /**
   * Bridge events dari CommandLoader ke CommandManager.
   * @private
   */
  _bridgeLoaderEvents() {
    const events = ['command.loaded', 'command.unloaded', 'command.reloaded', 'command.error'];
    for (const ev of events) {
      this.loader.on(ev, (payload) => this._emit(ev, payload));
    }

    // Watcher events
    const watcherEvents = ['watcher.reload', 'watcher.add', 'watcher.unload'];
    for (const ev of watcherEvents) {
      this.loader.on(ev, (payload) => {
        this._emit(ev, payload);
        this._triggerReloadCallbacks();
      });
    }
  }
}
