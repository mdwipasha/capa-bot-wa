/**
 * PluginWatcher
 * -------------
 * Memantau folder plugin secara real-time menggunakan fs.watch.
 * Jika ada perubahan (create/modify/delete), plugin otomatis
 * di-reload/unload tanpa restart bot.
 *
 * Fitur:
 *  - Debounce 300ms untuk mencegah double-trigger
 *  - Detect: file baru, diubah, dihapus
 *  - Emit events: 'watcher.reload', 'watcher.unload', 'watcher.add'
 */

import path from 'path';
import fs from 'fs-extra';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

export class PluginWatcher extends EventEmitter {
  /**
   * @param {object} options
   * @param {import('./PluginLoader.js').PluginLoader} options.loader
   * @param {number} [options.debounceMs=300]
   */
  constructor({ loader, debounceMs = 300 } = {}) {
    super();
    this.loader = loader;
    this.debounceMs = debounceMs;

    /** @type {fs.FSWatcher|null} */
    this._watcher = null;

    /** @type {Map<string, NodeJS.Timeout>} debounce timers per file */
    this._timers = new Map();

    /** folder yang sedang dipantau */
    this._watchedDir = null;
  }

  // ─────────────────────────────────────────────
  // Start / Stop
  // ─────────────────────────────────────────────

  /**
   * Mulai watch folder plugin.
   * @param {string} dir - path folder plugin
   */
  start(dir) {
    if (this._watcher) this.stop();

    this._watchedDir = dir;

    try {
      this._watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename || !filename.endsWith('.js')) return;

        // Resolve absolute path
        const filePath = path.resolve(dir, filename);

        // Debounce: cancel timer lama, set timer baru
        if (this._timers.has(filePath)) {
          clearTimeout(this._timers.get(filePath));
        }

        const timer = setTimeout(() => {
          this._timers.delete(filePath);
          this._handleChange(eventType, filePath);
        }, this.debounceMs);

        this._timers.set(filePath, timer);
      });

      this._watcher.on('error', (err) => {
        logger.error(`PluginWatcher: Error — ${err.message}`);
        this.emit('watcher.error', { error: err });
      });

      logger.info(`PluginWatcher: Memantau folder "${dir}"...`);
      this.emit('watcher.started', { dir });
    } catch (err) {
      logger.error(`PluginWatcher: Gagal memulai watcher — ${err.message}`);
    }
  }

  /**
   * Stop watcher.
   */
  stop() {
    if (this._watcher) {
      this._watcher.close();
      this._watcher = null;
    }

    // Cancel semua debounce timer
    for (const timer of this._timers.values()) clearTimeout(timer);
    this._timers.clear();

    logger.info('PluginWatcher: Watcher dihentikan.');
    this.emit('watcher.stopped', {});
  }

  /**
   * Apakah watcher sedang aktif.
   * @returns {boolean}
   */
  isRunning() {
    return this._watcher !== null;
  }

  // ─────────────────────────────────────────────
  // Change Handler
  // ─────────────────────────────────────────────

  /**
   * Handle perubahan file.
   * @param {string} eventType - 'rename' | 'change'
   * @param {string} filePath
   */
  async _handleChange(eventType, filePath) {
    const basename = path.basename(filePath);

    try {
      const exists = await fs.pathExists(filePath);

      if (!exists) {
        // File dihapus
        logger.info(`PluginWatcher: File dihapus "${basename}", unloading plugin...`);
        await this.loader.unloadFile(filePath);
        this.emit('watcher.unload', { filePath, basename });

      } else if (!this.loader.isTracked(filePath)) {
        // File baru
        logger.info(`PluginWatcher: File baru "${basename}", loading plugin...`);
        await this.loader.loadFile(filePath);
        this.emit('watcher.add', { filePath, basename });

      } else {
        // File diubah (reload)
        logger.info(`PluginWatcher: File berubah "${basename}", reloading plugin...`);
        await this.loader.reloadFile(filePath);
        this.emit('watcher.reload', { filePath, basename });
      }

    } catch (err) {
      logger.error(`PluginWatcher: Gagal handle perubahan "${basename}" — ${err.message}`);
      this.emit('watcher.error', { filePath, error: err });
    }
  }
}
