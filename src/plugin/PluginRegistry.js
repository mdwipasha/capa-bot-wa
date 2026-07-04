/**
 * PluginRegistry
 * --------------
 * In-memory registry yang menyimpan state semua plugin yang telah di-load.
 * Mendukung konfigurasi per-bot (enable/disable plugin per session).
 *
 * Entry schema:
 * {
 *   name, version, author, category, description,
 *   enabled, loadedAt, status, dependencies, filePath,
 *   alias, permissions, cooldown, minBotVersion, execute
 * }
 */

/** Status kemungkinan plugin */
export const PLUGIN_STATUS = {
  LOADED: 'loaded',
  ERROR: 'error',
  DISABLED: 'disabled',
  UNLOADED: 'unloaded'
};

export class PluginRegistry {
  constructor() {
    /** @type {Map<string, object>} name → plugin entry */
    this._plugins = new Map();

    /** @type {Map<string, string>} alias → plugin name */
    this._aliases = new Map();

    /**
     * Per-bot override config:
     * { [botId]: { [pluginName]: { enabled: boolean } } }
     * @type {Map<string, Map<string, object>>}
     */
    this._perBotConfig = new Map();
  }

  // ─────────────────────────────────────────────
  // Plugin CRUD
  // ─────────────────────────────────────────────

  /**
   * Daftarkan atau update plugin di registry.
   * @param {string} name
   * @param {object} entry - normalized plugin object
   * @returns {object} entry
   */
  set(name, entry) {
    const key = name.toLowerCase();

    // Hapus alias lama jika plugin sudah ada
    if (this._plugins.has(key)) {
      const old = this._plugins.get(key);
      for (const a of (old.alias || [])) this._aliases.delete(a);
    }

    const registryEntry = {
      ...entry,
      name: key,
      status: PLUGIN_STATUS.LOADED,
      loadedAt: new Date().toISOString()
    };
    this._plugins.set(key, registryEntry);

    // Register alias
    for (const alias of (entry.alias || [])) {
      this._aliases.set(String(alias).toLowerCase(), key);
    }

    return registryEntry;
  }

  /**
   * Ambil plugin dari registry (by name atau alias).
   * @param {string} name
   * @returns {object|null}
   */
  get(name) {
    const key = name.toLowerCase();
    return this._plugins.get(key)
      || this._plugins.get(this._aliases.get(key))
      || null;
  }

  /**
   * Hapus plugin dari registry beserta alias-nya.
   * @param {string} name
   * @returns {boolean}
   */
  delete(name) {
    const key = name.toLowerCase();
    const entry = this._plugins.get(key);
    if (!entry) return false;
    for (const a of (entry.alias || [])) this._aliases.delete(a);
    this._plugins.delete(key);
    // Bersihkan per-bot config untuk plugin ini
    for (const botConfig of this._perBotConfig.values()) botConfig.delete(key);
    return true;
  }

  /**
   * Semua plugin sebagai array.
   * @returns {object[]}
   */
  all() {
    return [...this._plugins.values()];
  }

  /**
   * Filter plugin.
   * @param {function} predicate
   * @returns {object[]}
   */
  filter(predicate) {
    return this.all().filter(predicate);
  }

  /**
   * Cek apakah plugin terdaftar.
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    const key = name.toLowerCase();
    return this._plugins.has(key) || this._aliases.has(key);
  }

  /**
   * Jumlah plugin yang terdaftar.
   * @returns {number}
   */
  size() {
    return this._plugins.size;
  }

  /**
   * Semua nama plugin yang terdaftar.
   * @returns {Set<string>}
   */
  names() {
    return new Set(this._plugins.keys());
  }

  /**
   * Semua alias yang terdaftar (alias → name).
   * @returns {Map<string, string>}
   */
  aliasMap() {
    return new Map(this._aliases);
  }

  // ─────────────────────────────────────────────
  // Enable / Disable (Global)
  // ─────────────────────────────────────────────

  /**
   * Set status enabled plugin secara global.
   * @param {string} name
   * @param {boolean} enabled
   * @returns {object|null} updated entry
   */
  setEnabled(name, enabled) {
    const entry = this.get(name);
    if (!entry) return null;
    entry.enabled = enabled;
    entry.status = enabled ? PLUGIN_STATUS.LOADED : PLUGIN_STATUS.DISABLED;
    return entry;
  }

  /**
   * Set status error pada plugin.
   * @param {string} name
   * @param {string} errorMsg
   */
  setError(name, errorMsg) {
    const entry = this.get(name);
    if (!entry) return null;
    entry.status = PLUGIN_STATUS.ERROR;
    entry.lastError = errorMsg;
    return entry;
  }

  // ─────────────────────────────────────────────
  // Per-Bot Config
  // ─────────────────────────────────────────────

  /**
   * Set konfigurasi plugin untuk bot tertentu.
   * @param {string} botId
   * @param {string} pluginName
   * @param {object} config - { enabled: boolean }
   */
  setPerBot(botId, pluginName, config) {
    const key = String(botId);
    if (!this._perBotConfig.has(key)) this._perBotConfig.set(key, new Map());
    const botMap = this._perBotConfig.get(key);
    const pluginKey = pluginName.toLowerCase();
    const existing = botMap.get(pluginKey) || {};
    botMap.set(pluginKey, { ...existing, ...config });
    return botMap.get(pluginKey);
  }

  /**
   * Ambil konfigurasi per-bot untuk satu plugin.
   * @param {string} botId
   * @param {string} pluginName
   * @returns {object|null}
   */
  getPerBot(botId, pluginName) {
    const botMap = this._perBotConfig.get(String(botId));
    if (!botMap) return null;
    return botMap.get(pluginName.toLowerCase()) || null;
  }

  /**
   * Cek apakah plugin enabled untuk bot tertentu.
   * Per-bot config override global config.
   * @param {string} botId
   * @param {string} pluginName
   * @returns {boolean}
   */
  isEnabledForBot(botId, pluginName) {
    const globalEntry = this.get(pluginName);
    if (!globalEntry) return false;

    const perBotConf = this.getPerBot(botId, pluginName);
    if (perBotConf !== null && typeof perBotConf.enabled === 'boolean') {
      return perBotConf.enabled;
    }
    return globalEntry.enabled !== false;
  }

  /**
   * Ambil semua plugin dengan status enabled/disabled disesuaikan per-bot.
   * @param {string} botId
   * @returns {object[]}
   */
  allForBot(botId) {
    return this.all().map((entry) => ({
      ...entry,
      enabledForBot: this.isEnabledForBot(botId, entry.name)
    }));
  }

  /**
   * Reset semua konfigurasi per-bot untuk satu bot.
   * @param {string} botId
   */
  clearPerBot(botId) {
    this._perBotConfig.delete(String(botId));
  }

  /**
   * Ambil semua per-bot config (untuk serialisasi/debug).
   * @returns {object}
   */
  getPerBotAll() {
    const result = {};
    for (const [botId, botMap] of this._perBotConfig.entries()) {
      result[botId] = Object.fromEntries(botMap.entries());
    }
    return result;
  }

  // ─────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────

  /**
   * Cari plugin berdasarkan query (name, category, description).
   * @param {string} query
   * @returns {object[]}
   */
  search(query) {
    const q = String(query).toLowerCase();
    return this.filter((entry) =>
      entry.name.includes(q) ||
      (entry.category || '').includes(q) ||
      (entry.description || '').toLowerCase().includes(q) ||
      (entry.author || '').toLowerCase().includes(q) ||
      (entry.alias || []).some((a) => a.includes(q))
    );
  }

  // ─────────────────────────────────────────────
  // Snapshot (untuk API/Dashboard)
  // ─────────────────────────────────────────────

  /**
   * Return snapshot plugin tanpa method execute (safe untuk JSON).
   * @param {string|null} botId
   * @returns {object[]}
   */
  snapshot(botId = null) {
    const list = botId ? this.allForBot(botId) : this.all();
    return list.map(({ execute, ...meta }) => ({
      ...meta,
      hasExecute: typeof execute === 'function'
    }));
  }
}
