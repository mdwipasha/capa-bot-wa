/**
 * PluginLoader
 * ------------
 * Bertanggung jawab untuk:
 *  - Scan folder plugin (recursive walk)
 *  - Load plugin dari file (dynamic import + cache-busting)
 *  - Unload plugin
 *  - Reload plugin (unload + load ulang)
 *  - Menjalankan hooks: onLoad, onUnload, onReload
 *  - Emit events via EventEmitter
 *
 * PluginLoader TIDAK menyimpan registry sendiri — ia delegasi ke
 * PluginRegistry dan PluginValidator yang diinject.
 */

import path from 'path';
import { EventEmitter } from 'events';
import { pathToFileURL } from 'url';
import fs from 'fs-extra';
import { logger } from '../utils/logger.js';
import { PluginValidator } from './PluginValidator.js';
import { PLUGIN_STATUS } from './PluginRegistry.js';

export class PluginLoader extends EventEmitter {
  /**
   * @param {object} options
   * @param {import('./PluginRegistry.js').PluginRegistry} options.registry
   * @param {PluginValidator} [options.validator]
   */
  constructor({ registry, validator = new PluginValidator() } = {}) {
    super();
    this.registry = registry;
    this.validator = validator;

    /** Track filePath → plugin name untuk unload/reload */
    this._fileMap = new Map(); // filePath → pluginName
  }

  // ─────────────────────────────────────────────
  // Scan & Load All
  // ─────────────────────────────────────────────

  /**
   * Scan folder dan load semua file plugin .js.
   * @param {string} dir - absolute atau relative path ke folder plugin
   */
  async loadAll(dir) {
    const files = await this._walk(dir);
    let loaded = 0;
    let failed = 0;

    for (const file of files) {
      const ok = await this.loadFile(file);
      if (ok) loaded++; else failed++;
    }

    logger.success(`PluginLoader: ${loaded} plugin loaded, ${failed} gagal.`);
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
   * Load satu file plugin.
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
        logger.warn(`PluginLoader: ${path.basename(filePath)} tidak memiliki export default, dilewati.`);
        return false;
      }

      // Quick check sebelum validasi penuh
      const quick = this.validator.quickCheck(raw);
      if (!quick.valid) {
        logger.warn(`PluginLoader: ${path.basename(filePath)} — ${quick.reason} Dilewati.`);
        return false;
      }

      // Validasi penuh (dengan duplikat check)
      const existingNames = this.registry.names();
      const existingAliases = this.registry.aliasMap();

      // Kecualikan nama plugin yang sedang direload dari pengecekan duplikat
      const currentName = this._fileMap.get(filePath);
      if (currentName) {
        existingNames.delete(currentName);
        // Hapus alias plugin ini dari existingAliases
        const current = this.registry.get(currentName);
        if (current) {
          for (const a of (current.alias || [])) existingAliases.delete(a);
        }
      }

      const result = this.validator.validate(raw, { filePath, existingNames, existingAliases });

      if (result.warnings.length > 0) {
        for (const w of result.warnings) logger.warn(`PluginLoader [${result.name}]: ${w}`);
      }

      const normalized = result.normalized;

      // Run onLoad hook jika ada
      if (typeof normalized.onLoad === 'function') {
        await this._runHook(normalized, 'onLoad');
      }

      // Register ke registry
      this.registry.set(normalized.name, { ...normalized, filePath });
      this._fileMap.set(filePath, normalized.name);

      logger.info(`PluginLoader: Plugin "${normalized.name}" v${normalized.version} loaded.`);
      this.emit('plugin.loaded', { name: normalized.name, filePath });
      return true;

    } catch (error) {
      const pluginName = this._fileMap.get(filePath) || path.basename(filePath, '.js');
      logger.error(`PluginLoader: Gagal load "${pluginName}" — ${error.message}`);

      // Tandai plugin sebagai error di registry jika sudah terdaftar
      this.registry.setError(pluginName, error.message);
      this.emit('plugin.error', { name: pluginName, filePath, error });
      return false;
    }
  }

  /**
   * Unload satu plugin by file path.
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

    logger.info(`PluginLoader: Plugin "${name}" unloaded.`);
    this.emit('plugin.unloaded', { name, filePath });
    return true;
  }

  /**
   * Reload satu plugin by file path (unload + load ulang).
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

    // Load ulang
    const ok = await this.loadFile(filePath);

    if (ok) {
      const newName = this._fileMap.get(filePath);
      logger.info(`PluginLoader: Plugin "${newName || name}" reloaded.`);
      this.emit('plugin.reloaded', { name: newName || name, filePath });
    }

    return ok;
  }

  // ─────────────────────────────────────────────
  // Unload semua
  // ─────────────────────────────────────────────

  /**
   * Unload semua plugin yang saat ini di-track.
   */
  async unloadAll() {
    const files = [...this._fileMap.keys()];
    for (const filePath of files) await this.unloadFile(filePath);
    logger.info('PluginLoader: Semua plugin unloaded.');
  }

  // ─────────────────────────────────────────────
  // Introspection
  // ─────────────────────────────────────────────

  /**
   * Return map filePath → pluginName
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

  // ─────────────────────────────────────────────
  // Hook runner
  // ─────────────────────────────────────────────

  /**
   * Jalankan lifecycle hook plugin dengan aman.
   * Jika hook error, plugin tidak crash — hanya log.
   * @param {object} entry
   * @param {'onLoad'|'onUnload'|'onReload'|'onEnable'|'onDisable'} hookName
   */
  async _runHook(entry, hookName) {
    try {
      await entry[hookName]();
    } catch (err) {
      logger.error(`PluginLoader: Hook "${hookName}" pada plugin "${entry.name}" error — ${err.message}`);
    }
  }
}
