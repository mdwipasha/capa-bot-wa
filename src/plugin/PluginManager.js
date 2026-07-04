/**
 * PluginManager
 * -------------
 * Façade utama untuk seluruh operasi plugin.
 * Komponen lain (BotManager, Dashboard) hanya boleh berinteraksi
 * dengan plugin melalui PluginManager — tidak langsung ke folder plugin.
 *
 * Arsitektur:
 *   Dashboard → REST API → BotManager → PluginManager → PluginLoader → Plugin
 *
 * Methods publik:
 *   loadPlugins()       reloadPlugins()    reloadPlugin()
 *   enablePlugin()      disablePlugin()    installPlugin()
 *   uninstallPlugin()   deletePlugin()     getPlugins()
 *   getPlugin()         searchPlugin()     getPluginsForBot()
 *   enablePluginForBot() disablePluginForBot()
 */

import path from 'path';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import { logger } from '../utils/logger.js';
import { PluginRegistry, PLUGIN_STATUS } from './PluginRegistry.js';
import { PluginLoader } from './PluginLoader.js';
import { PluginWatcher } from './PluginWatcher.js';
import { PluginValidator } from './PluginValidator.js';

export class PluginManagerError extends Error {
  constructor(message, code = 'PLUGIN_MANAGER_ERROR') {
    super(message);
    this.name = 'PluginManagerError';
    this.code = code;
  }
}

export class PluginManager extends EventEmitter {
  /**
   * @param {object} options
   * @param {string} options.pluginsDir - path folder plugin (e.g. 'src/commands')
   * @param {import('../manager/EventBus.js').EventBus} [options.eventBus] - shared EventBus
   * @param {boolean} [options.watchEnabled=true] - aktifkan hot-reload watcher
   */
  constructor({
    pluginsDir = 'src/commands',
    eventBus = null,
    watchEnabled = true
  } = {}) {
    super();
    this.pluginsDir = path.resolve(pluginsDir);
    this.eventBus = eventBus;
    this.watchEnabled = watchEnabled;

    // Inisialisasi layer
    this.validator = new PluginValidator();
    this.registry = new PluginRegistry();
    this.loader = new PluginLoader({ registry: this.registry, validator: this.validator });
    this.watcher = new PluginWatcher({ loader: this.loader });

    // Pasang event listener dari loader & watcher ke PluginManager
    this._bridgeLoaderEvents();
    this._bridgeWatcherEvents();

    /** Callbacks yang dipanggil saat ada reload (untuk backward compat CommandLoader) */
    this._reloadCallbacks = [];
  }

  // ─────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────

  /**
   * Load semua plugin dari folder plugin.
   * @returns {Promise<object[]>} list plugin yang berhasil di-load
   */
  async loadPlugins() {
    logger.info('PluginManager: Loading semua plugin...');
    await this.loader.loadAll(this.pluginsDir);

    if (this.watchEnabled && !this.watcher.isRunning()) {
      this.watcher.start(this.pluginsDir);
    }

    const plugins = this.registry.all();
    this._emit('plugin.loaded', { total: plugins.length });
    logger.success(`PluginManager: ${plugins.length} plugin aktif.`);
    return plugins;
  }

  /**
   * Reload semua plugin (unload semua + load ulang dari disk).
   * @returns {Promise<object[]>}
   */
  async reloadPlugins() {
    logger.info('PluginManager: Reloading semua plugin...');
    await this.loader.unloadAll();
    await this.loader.loadAll(this.pluginsDir);

    const plugins = this.registry.all();
    this._emit('plugin.reloaded', { total: plugins.length });
    this._triggerReloadCallbacks();
    logger.success(`PluginManager: Reload selesai — ${plugins.length} plugin aktif.`);
    return plugins;
  }

  /**
   * Reload satu plugin by name.
   * @param {string} name
   * @returns {Promise<object|null>}
   */
  async reloadPlugin(name) {
    const entry = this._requirePlugin(name);
    const filePath = entry.filePath;

    if (!filePath) {
      throw new PluginManagerError(
        `Plugin "${name}" tidak memiliki filePath, tidak bisa direload.`,
        'PLUGIN_NO_FILEPATH'
      );
    }

    logger.info(`PluginManager: Reloading plugin "${name}"...`);
    const ok = await this.loader.reloadFile(filePath);

    if (!ok) {
      throw new PluginManagerError(`Gagal reload plugin "${name}".`, 'PLUGIN_RELOAD_FAILED');
    }

    const updated = this.registry.get(name);
    this._emit('plugin.reloaded', { name, plugin: updated });
    this._triggerReloadCallbacks();
    return updated;
  }

  // ─────────────────────────────────────────────
  // Enable / Disable (Global)
  // ─────────────────────────────────────────────

  /**
   * Enable plugin secara global.
   * @param {string} name
   * @returns {object} updated entry
   */
  async enablePlugin(name) {
    const entry = this._requirePlugin(name);
    const updated = this.registry.setEnabled(name, true);

    // Run onEnable hook
    if (entry && typeof entry.onEnable === 'function') {
      await this.loader._runHook(entry, 'onEnable');
    }

    this._emit('plugin.enabled', { name });
    logger.info(`PluginManager: Plugin "${name}" diaktifkan.`);
    this._triggerReloadCallbacks();
    return updated;
  }

  /**
   * Disable plugin secara global.
   * @param {string} name
   * @returns {object} updated entry
   */
  async disablePlugin(name) {
    const entry = this._requirePlugin(name);
    const updated = this.registry.setEnabled(name, false);

    // Run onDisable hook
    if (entry && typeof entry.onDisable === 'function') {
      await this.loader._runHook(entry, 'onDisable');
    }

    this._emit('plugin.disabled', { name });
    logger.info(`PluginManager: Plugin "${name}" dinonaktifkan.`);
    this._triggerReloadCallbacks();
    return updated;
  }

  // ─────────────────────────────────────────────
  // Enable / Disable (Per-Bot)
  // ─────────────────────────────────────────────

  /**
   * Enable plugin untuk bot tertentu saja.
   * @param {string} name
   * @param {string} botId
   * @returns {object}
   */
  enablePluginForBot(name, botId) {
    this._requirePlugin(name);
    const config = this.registry.setPerBot(botId, name, { enabled: true });
    this._emit('plugin.enabled', { name, botId });
    this._triggerReloadCallbacks();
    return { name, botId, ...config };
  }

  /**
   * Disable plugin untuk bot tertentu saja.
   * @param {string} name
   * @param {string} botId
   * @returns {object}
   */
  disablePluginForBot(name, botId) {
    this._requirePlugin(name);
    const config = this.registry.setPerBot(botId, name, { enabled: false });
    this._emit('plugin.disabled', { name, botId });
    this._triggerReloadCallbacks();
    return { name, botId, ...config };
  }

  // ─────────────────────────────────────────────
  // Install / Uninstall / Delete
  // ─────────────────────────────────────────────

  /**
   * Install plugin baru dari file path atau raw JS content.
   * @param {object} options
   * @param {string} [options.filePath] - copy dari path ini ke pluginsDir
   * @param {string} [options.category='general'] - subfolder tujuan
   * @param {string} [options.filename] - nama file tujuan
   * @returns {Promise<object|null>}
   */
  async installPlugin({ filePath, category = 'general', filename } = {}) {
    if (!filePath) {
      throw new PluginManagerError(
        'installPlugin() membutuhkan filePath. Upload file plugin terlebih dahulu.',
        'PLUGIN_INSTALL_NO_SOURCE'
      );
    }

    const exists = await fs.pathExists(filePath);
    if (!exists) {
      throw new PluginManagerError(`File tidak ditemukan: ${filePath}`, 'PLUGIN_FILE_NOT_FOUND');
    }

    const destDir = path.join(this.pluginsDir, category);
    await fs.ensureDir(destDir);

    const destFile = path.join(destDir, filename || path.basename(filePath));
    await fs.copy(filePath, destFile, { overwrite: false });

    const ok = await this.loader.loadFile(destFile);
    if (!ok) {
      // Rollback
      await fs.remove(destFile).catch(() => {});
      throw new PluginManagerError(`Gagal install plugin dari "${filePath}".`, 'PLUGIN_INSTALL_FAILED');
    }

    const name = this.loader.getFileMap().get(destFile);
    const entry = name ? this.registry.get(name) : null;

    this._emit('plugin.installed', { name, filePath: destFile });
    logger.success(`PluginManager: Plugin "${name}" berhasil diinstall.`);
    return entry;
  }

  /**
   * Uninstall plugin: disable + hapus dari registry (file tidak dihapus).
   * @param {string} name
   * @returns {{ ok: boolean }}
   */
  async uninstallPlugin(name) {
    const entry = this._requirePlugin(name);
    if (entry.filePath) {
      await this.loader.unloadFile(entry.filePath);
    } else {
      this.registry.delete(name);
    }
    this._emit('plugin.deleted', { name });
    this._triggerReloadCallbacks();
    logger.info(`PluginManager: Plugin "${name}" diuninstall.`);
    return { ok: true, name };
  }

  /**
   * Delete plugin: hapus file fisik dari disk + unload dari registry.
   * @param {string} name
   * @returns {{ ok: boolean }}
   */
  async deletePlugin(name) {
    const entry = this._requirePlugin(name);

    if (!entry.filePath) {
      throw new PluginManagerError(
        `Plugin "${name}" tidak memiliki filePath, tidak bisa dihapus dari disk.`,
        'PLUGIN_NO_FILEPATH'
      );
    }

    // Unload dulu
    await this.loader.unloadFile(entry.filePath);

    // Hapus file fisik
    await fs.remove(entry.filePath);

    this._emit('plugin.deleted', { name, filePath: entry.filePath });
    logger.info(`PluginManager: Plugin "${name}" dan file-nya dihapus.`);
    return { ok: true, name };
  }

  // ─────────────────────────────────────────────
  // Query
  // ─────────────────────────────────────────────

  /**
   * Get semua plugin (atau untuk bot tertentu).
   * @param {string|null} [botId=null]
   * @returns {object[]}
   */
  getPlugins(botId = null) {
    return this.registry.snapshot(botId);
  }

  /**
   * Get semua plugin yang enabled (siap dieksekusi).
   * Digunakan oleh CommandLoader adapter untuk `list()`.
   * Mengembalikan plugin lengkap (dengan execute function).
   * @param {string|null} [botId=null]
   * @returns {object[]}
   */
  getEnabledPlugins(botId = null) {
    if (botId) {
      return this.registry.allForBot(botId).filter((p) => p.enabledForBot !== false);
    }
    return this.registry.filter((p) => p.enabled !== false && p.status !== PLUGIN_STATUS.ERROR);
  }

  /**
   * Get satu plugin by name atau alias.
   * Mengembalikan null jika tidak ada, disabled secara global, atau disabled untuk botId.
   * @param {string} name
   * @param {string|null} [botId=null]
   * @returns {object|null}
   */
  getPlugin(name, botId = null) {
    const entry = this.registry.get(name);
    if (!entry) return null;

    // Cek global enabled flag
    if (entry.enabled === false) return null;

    // Cek per-bot jika ada botId
    if (botId) {
      const enabled = this.registry.isEnabledForBot(botId, entry.name);
      if (!enabled) return null;
    }

    return entry;
  }

  /**
   * Cari plugin by query (name, category, description, author, alias).
   * @param {string} query
   * @returns {object[]}
   */
  searchPlugin(query) {
    return this.registry.search(query).map(({ execute, ...meta }) => ({
      ...meta,
      hasExecute: typeof execute === 'function'
    }));
  }

  /**
   * Get semua plugin untuk bot tertentu (dengan enabled status per-bot).
   * @param {string} botId
   * @returns {object[]}
   */
  getPluginsForBot(botId) {
    return this.registry.snapshot(botId);
  }

  /**
   * Total jumlah plugin yang terdaftar.
   * @returns {number}
   */
  count() {
    return this.registry.size();
  }

  // ─────────────────────────────────────────────
  // Watcher Control
  // ─────────────────────────────────────────────

  /**
   * Mulai file watcher (jika belum berjalan).
   */
  startWatcher() {
    if (!this.watcher.isRunning()) {
      this.watcher.start(this.pluginsDir);
    }
  }

  /**
   * Stop file watcher.
   */
  stopWatcher() {
    this.watcher.stop();
  }

  // ─────────────────────────────────────────────
  // Reload Callback (Backward Compat)
  // ─────────────────────────────────────────────

  /**
   * Register callback yang dipanggil setiap kali ada perubahan plugin.
   * Digunakan oleh CommandLoader adapter untuk backward compat dengan
   * pattern lama: `loader.watch(onReload)`.
   * @param {function} callback
   */
  onReload(callback) {
    if (typeof callback === 'function') {
      this._reloadCallbacks.push(callback);
    }
  }

  /**
   * Panggil semua reload callbacks.
   * @private
   */
  _triggerReloadCallbacks() {
    for (const cb of this._reloadCallbacks) {
      try { cb(); } catch (err) {
        logger.error(`PluginManager: Reload callback error — ${err.message}`);
      }
    }
  }

  // ─────────────────────────────────────────────
  // Internal Helpers
  // ─────────────────────────────────────────────

  /**
   * Require plugin ada di registry. Lempar error jika tidak.
   * @param {string} name
   * @returns {object}
   */
  _requirePlugin(name) {
    const entry = this.registry.get(name);
    if (!entry) {
      throw new PluginManagerError(`Plugin "${name}" tidak ditemukan.`, 'PLUGIN_NOT_FOUND');
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
   * Pasang event dari PluginLoader ke PluginManager.
   * @private
   */
  _bridgeLoaderEvents() {
    const events = ['plugin.loaded', 'plugin.unloaded', 'plugin.reloaded', 'plugin.error'];
    for (const ev of events) {
      this.loader.on(ev, (payload) => this._emit(ev, payload));
    }
  }

  /**
   * Pasang event dari PluginWatcher ke PluginManager.
   * Auto-trigger reload callbacks saat watcher mendeteksi perubahan.
   * @private
   */
  _bridgeWatcherEvents() {
    const reloadTriggers = ['watcher.reload', 'watcher.add', 'watcher.unload'];
    for (const ev of reloadTriggers) {
      this.watcher.on(ev, (payload) => {
        this._emit(ev, payload);
        this._triggerReloadCallbacks();
      });
    }

    this.watcher.on('watcher.error', (payload) => {
      this._emit('plugin.error', payload);
    });
  }
}
