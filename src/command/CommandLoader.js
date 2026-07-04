/**
 * CommandLoader
 * -------------
 * Bertanggung jawab untuk:
 *  - Scan folder command (recursive walk via PluginLoader)
 *  - Load command dari file (dynamic import + cache-busting)
 *  - Unload command
 *  - Reload command (unload + load ulang)
 *  - Watch perubahan file (via PluginWatcher)
 *  - Validasi command sebelum register ke CommandRegistry
 *
 * Menggunakan PluginLoader sebagai engine I/O (tidak duplikat kode),
 * namun registry yang digunakan adalah CommandRegistry yang terpisah.
 */

import path from 'path';
import { EventEmitter } from 'events';
import { pathToFileURL } from 'url';
import fs from 'fs-extra';
import { logger } from '../utils/logger.js';
import { CommandValidator } from './CommandValidator.js';
import { COMMAND_STATUS } from './CommandRegistry.js';

export class CommandLoader extends EventEmitter {
  /**
   * @param {object} options
   * @param {import('./CommandRegistry.js').CommandRegistry} options.registry
   * @param {CommandValidator} [options.validator]
   */
  constructor({ registry, validator = new CommandValidator() } = {}) {
    super();
    this.registry = registry;
    this.validator = validator;

    /** Track filePath → commandName untuk unload/reload */
    this._fileMap = new Map(); // filePath → commandName

    /** fs.watch watcher instance */
    this._watcher = null;

    /** Debounce timer map: filePath → timeout */
    this._debounceMap = new Map();

    /** Callback list untuk hot-reload notification */
    this._reloadCallbacks = [];
  }

  // ─────────────────────────────────────────────
  // Scan & Load All
  // ─────────────────────────────────────────────

  /**
   * Scan folder dan load semua file command .js
   * @param {string} dir - path folder command
   * @returns {Promise<{ loaded: number, failed: number, total: number }>}
   */
  async loadAll(dir) {
    const files = await this._walk(dir);
    let loaded = 0;
    let failed = 0;

    for (const file of files) {
      const ok = await this.loadFile(file);
      if (ok) loaded++;
      else failed++;
    }

    logger.success(`CommandLoader: ${loaded} command loaded, ${failed} gagal.`);
    this.emit('loader.done', { loaded, failed, total: files.length });
    return { loaded, failed, total: files.length };
  }

  /**
   * Walk rekursif, return array path file .js
   * @param {string} dir
   * @returns {Promise<string[]>}
   */
  async _walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    const nested = await Promise.all(entries.map((entry) => {
      const full = path.resolve(dir, entry.name);
      return entry.isDirectory() ? this._walk(full) : full;
    }));
    return nested.flat().filter((f) => f.endsWith('.js'));
  }

  // ─────────────────────────────────────────────
  // Load / Reload / Unload satu file
  // ─────────────────────────────────────────────

  /**
   * Load satu file command.
   * @param {string} filePath - path absolut ke file .js
   * @returns {Promise<boolean>} true jika berhasil
   */
  async loadFile(filePath) {
    try {
      // Dynamic import dengan cache-busting
      const url = `${pathToFileURL(filePath).href}?t=${Date.now()}`;
      const mod = await import(url);
      const raw = mod.default;

      if (!raw) {
        logger.warn(`CommandLoader: ${path.basename(filePath)} tidak memiliki export default, dilewati.`);
        return false;
      }

      // Quick check
      const quick = this.validator.quickCheck(raw);
      if (!quick.valid) {
        logger.warn(`CommandLoader: ${path.basename(filePath)} — ${quick.reason} Dilewati.`);
        return false;
      }

      // Validasi penuh dengan duplikat check
      const existingNames = this.registry.names();
      const existingAliases = this.registry.aliasMap();

      // Kecualikan nama command yang sedang direload dari pengecekan duplikat
      const currentName = this._fileMap.get(filePath);
      if (currentName) {
        existingNames.delete(currentName);
        const current = this.registry.get(currentName);
        if (current) {
          for (const a of (current.aliases || current.alias || [])) existingAliases.delete(a);
        }
      }

      const result = this.validator.validate(raw, { filePath, existingNames, existingAliases });

      if (result.warnings.length > 0) {
        for (const w of result.warnings) logger.warn(`CommandLoader [${result.name}]: ${w}`);
      }

      const normalized = result.normalized;

      // Run onLoad hook jika ada
      if (typeof normalized.onLoad === 'function') {
        await this._runHook(normalized, 'onLoad');
      }

      // Register ke CommandRegistry
      this.registry.set(normalized.name, { ...normalized, filePath });
      this._fileMap.set(filePath, normalized.name);

      logger.info(`CommandLoader: Command "${normalized.name}" v${normalized.version} loaded.`);
      this.emit('command.loaded', { name: normalized.name, filePath });
      return true;

    } catch (error) {
      const commandName = this._fileMap.get(filePath) || path.basename(filePath, '.js');
      logger.error(`CommandLoader: Gagal load "${commandName}" — ${error.message}`);
      this.registry.setError(commandName, error.message);
      this.emit('command.error', { name: commandName, filePath, error });
      return false;
    }
  }

  /**
   * Unload satu command by file path.
   * @param {string} filePath
   * @returns {Promise<boolean>}
   */
  async unloadFile(filePath) {
    const name = this._fileMap.get(filePath);
    if (!name) return false;

    const entry = this.registry.get(name);

    // Run onUnload hook
    if (entry && typeof entry.onUnload === 'function') {
      await this._runHook(entry, 'onUnload');
    }

    this.registry.delete(name);
    this._fileMap.delete(filePath);

    logger.info(`CommandLoader: Command "${name}" unloaded.`);
    this.emit('command.unloaded', { name, filePath });
    return true;
  }

  /**
   * Reload satu command by file path (unload + load ulang).
   * Hot reload: Unload → Clear Cache → Import ulang → Register ulang
   * @param {string} filePath
   * @returns {Promise<boolean>}
   */
  async reloadFile(filePath) {
    const name = this._fileMap.get(filePath);
    const entry = name ? this.registry.get(name) : null;

    // Run onReload hook sebelum unload
    if (entry && typeof entry.onReload === 'function') {
      await this._runHook(entry, 'onReload');
    }

    // Unload dulu (jika ada)
    if (name) await this.unloadFile(filePath);

    // Load ulang (import ulang dengan cache-busting via ?t=timestamp)
    const ok = await this.loadFile(filePath);

    if (ok) {
      const newName = this._fileMap.get(filePath);
      logger.info(`CommandLoader: Command "${newName || name}" reloaded.`);
      this.emit('command.reloaded', { name: newName || name, filePath });

      // Trigger reload callbacks (untuk MessageRouter.clear() dll.)
      this._triggerReloadCallbacks();
    }

    return ok;
  }

  /**
   * Unload semua command yang saat ini di-track.
   */
  async unloadAll() {
    const files = [...this._fileMap.keys()];
    for (const filePath of files) await this.unloadFile(filePath);
    logger.info('CommandLoader: Semua command unloaded.');
  }

  // ─────────────────────────────────────────────
  // File Watcher (Hot Reload)
  // ─────────────────────────────────────────────

  /**
   * Start watching folder untuk hot-reload.
   * @param {string} dir - folder command
   */
  startWatcher(dir) {
    if (this._watcher) return; // sudah berjalan

    try {
      this._watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename || !filename.endsWith('.js')) return;

        const filePath = path.resolve(dir, filename);

        // Debounce: tunggu 300ms setelah event terakhir
        if (this._debounceMap.has(filePath)) {
          clearTimeout(this._debounceMap.get(filePath));
        }

        const timer = setTimeout(async () => {
          this._debounceMap.delete(filePath);
          await this._handleFileChange(eventType, filePath);
        }, 300);

        this._debounceMap.set(filePath, timer);
      });

      this._watcher.on('error', (err) => {
        logger.error(`CommandLoader Watcher error: ${err.message}`);
      });

      logger.info(`CommandLoader: Watching "${dir}" untuk hot-reload.`);
    } catch (err) {
      logger.warn(`CommandLoader: Tidak bisa start watcher — ${err.message}`);
    }
  }

  /**
   * Stop file watcher.
   */
  stopWatcher() {
    if (this._watcher) {
      this._watcher.close();
      this._watcher = null;
      logger.info('CommandLoader: Watcher stopped.');
    }
  }

  /**
   * Cek apakah watcher berjalan.
   * @returns {boolean}
   */
  isWatching() {
    return this._watcher !== null;
  }

  /**
   * Handle perubahan file dari watcher.
   * @private
   */
  async _handleFileChange(eventType, filePath) {
    const exists = await fs.pathExists(filePath);

    if (!exists) {
      // File dihapus
      if (this._fileMap.has(filePath)) {
        await this.unloadFile(filePath);
        this.emit('watcher.unload', { filePath });
        this._triggerReloadCallbacks();
      }
      return;
    }

    if (this._fileMap.has(filePath)) {
      // File diubah → reload
      await this.reloadFile(filePath);
      this.emit('watcher.reload', { filePath });
    } else {
      // File baru → load
      const ok = await this.loadFile(filePath);
      if (ok) {
        this.emit('watcher.add', { filePath });
        this._triggerReloadCallbacks();
      }
    }
  }

  // ─────────────────────────────────────────────
  // Reload Callback
  // ─────────────────────────────────────────────

  /**
   * Register callback yang dipanggil setiap kali ada reload.
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
        logger.error(`CommandLoader: Reload callback error — ${err.message}`);
      }
    }
  }

  // ─────────────────────────────────────────────
  // Introspection
  // ─────────────────────────────────────────────

  /**
   * Return map filePath → commandName
   * @returns {Map<string, string>}
   */
  getFileMap() {
    return new Map(this._fileMap);
  }

  /**
   * Cek apakah file sedang di-track
   * @param {string} filePath
   * @returns {boolean}
   */
  isTracked(filePath) {
    return this._fileMap.has(filePath);
  }

  /**
   * Resolve filePath dari nama command.
   * @param {string} commandName
   * @returns {string|null}
   */
  getFilePath(commandName) {
    for (const [filePath, name] of this._fileMap) {
      if (name === commandName.toLowerCase()) return filePath;
    }
    return null;
  }

  // ─────────────────────────────────────────────
  // Hook Runner
  // ─────────────────────────────────────────────

  /**
   * Jalankan lifecycle hook command dengan aman.
   * @param {object} entry
   * @param {'onLoad'|'onUnload'|'onReload'|'onEnable'|'onDisable'} hookName
   */
  async _runHook(entry, hookName) {
    try {
      await entry[hookName]();
    } catch (err) {
      logger.error(`CommandLoader: Hook "${hookName}" pada command "${entry.name}" error — ${err.message}`);
    }
  }
}
