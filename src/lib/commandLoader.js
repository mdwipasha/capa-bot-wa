/**
 * CommandLoader — Thin Adapter atas PluginManager
 * ------------------------------------------------
 * API publik (load, get, list, watch) IDENTIK dengan versi lama.
 * Semua consumer (commandHandler, MessageRouter, BotManager, menu.js)
 * tidak perlu diubah sama sekali.
 *
 * Jika pluginManager tidak diinject, CommandLoader membuat PluginManager
 * internal secara otomatis (backward compatible).
 */

import { logger } from '../utils/logger.js';
import { PluginManager } from '../plugin/PluginManager.js';

export class CommandLoader {
  /**
   * @param {string} commandsDir - path folder plugin/commands
   * @param {PluginManager|null} [pluginManager=null] - PluginManager instance (opsional)
   */
  constructor(commandsDir, pluginManager = null) {
    this.commandsDir = commandsDir;
    this.pluginManager = pluginManager || new PluginManager({
      pluginsDir: commandsDir,
      watchEnabled: false // watcher dikelola oleh PluginManager yang diinject
    });
  }

  /**
   * Load semua plugin dari folder.
   * Dipanggil oleh BotManager.loadCommands() / loadPlugins().
   */
  async load() {
    await this.pluginManager.loadPlugins();
    logger.success(`Loaded ${this.pluginManager.count()} commands`);
  }

  /**
   * Ambil command by name atau alias.
   * Digunakan oleh commandHandler dan MessageRouter.getLoaderProxy().
   * @param {string} name
   * @param {string|null} [botId=null] - opsional per-bot filter
   * @returns {object|null}
   */
  get(name, botId = null) {
    return this.pluginManager.getPlugin(name, botId) || null;
  }

  /**
   * List semua command yang enabled.
   * Digunakan oleh menu.js dan berbagai tempat lain.
   * @param {string|null} [botId=null] - opsional per-bot filter
   * @returns {object[]}
   */
  list(botId = null) {
    return this.pluginManager.getEnabledPlugins(botId);
  }

  /**
   * Watch folder untuk hot-reload.
   * Dipanggil di index.js: loader.watch(() => { ... })
   * @param {function} onReload - callback dipanggil setiap ada perubahan
   */
  watch(onReload) {
    // Register callback ke PluginManager (akan dipanggil saat ada reload)
    this.pluginManager.onReload(onReload);

    // Aktifkan watcher jika belum
    this.pluginManager.startWatcher();
  }

  // ─────────────────────────────────────────────
  // Pass-through helpers (opsional, untuk debugging)
  // ─────────────────────────────────────────────

  /**
   * Expose PluginManager untuk BotManager agar bisa diinject.
   * @returns {PluginManager}
   */
  getPluginManager() {
    return this.pluginManager;
  }
}

