/**
 * CommandRegistry
 * ---------------
 * In-memory registry yang menyimpan state semua command yang telah di-load.
 * Mendukung:
 * - Konfigurasi per-bot (enable/disable command per session)
 * - Konfigurasi per-group (enable/disable command per grup)
 * - Konfigurasi per-user (whitelist, blacklist, premium, VIP)
 * - Statistik eksekusi command (total, sukses, gagal, avg time, last execute)
 *
 * Entry schema:
 * {
 *   name, aliases, category, version, author, description,
 *   usage, examples, enabled, ownerOnly, adminOnly, groupOnly,
 *   privateOnly, premiumOnly, permissions, cooldown, hidden,
 *   tags, filePath, loadedAt, status, statistics, execute
 * }
 */

/** Status kemungkinan command */
export const COMMAND_STATUS = {
  LOADED: 'loaded',
  ERROR: 'error',
  DISABLED: 'disabled',
  UNLOADED: 'unloaded'
};

export class CommandRegistry {
  constructor() {
    /** @type {Map<string, object>} name → command entry */
    this._commands = new Map();

    /** @type {Map<string, string>} alias → command name */
    this._aliases = new Map();

    /**
     * Per-bot config override: { botId: { commandName: { enabled: boolean } } }
     * @type {Map<string, Map<string, object>>}
     */
    this._perBotConfig = new Map();

    /**
     * Per-group config override: { groupJid: { commandName: { enabled: boolean } } }
     * @type {Map<string, Map<string, object>>}
     */
    this._perGroupConfig = new Map();

    /**
     * Per-user config: { userJid: { commandName: { whitelist, blacklist, premium, vip } } }
     * @type {Map<string, Map<string, object>>}
     */
    this._perUserConfig = new Map();

    /**
     * Statistik eksekusi: { commandName: { total, success, failed, totalTime, lastExecute, today } }
     * @type {Map<string, object>}
     */
    this._stats = new Map();
  }

  // ─────────────────────────────────────────────
  // Command CRUD
  // ─────────────────────────────────────────────

  /**
   * Daftarkan atau update command di registry.
   * @param {string} name
   * @param {object} entry - normalized command object
   * @returns {object} entry
   */
  set(name, entry) {
    const key = name.toLowerCase();

    // Hapus alias lama jika command sudah ada
    if (this._commands.has(key)) {
      const old = this._commands.get(key);
      for (const a of (old.aliases || old.alias || [])) this._aliases.delete(a);
    }

    const registryEntry = {
      ...entry,
      name: key,
      status: COMMAND_STATUS.LOADED,
      loadedAt: new Date().toISOString()
    };
    this._commands.set(key, registryEntry);

    // Register semua alias
    for (const alias of (entry.aliases || entry.alias || [])) {
      this._aliases.set(String(alias).toLowerCase(), key);
    }

    // Init statistik jika belum ada
    if (!this._stats.has(key)) {
      this._stats.set(key, this._initStats());
    }

    return registryEntry;
  }

  /**
   * Ambil command dari registry (by name atau alias).
   * @param {string} name
   * @returns {object|null}
   */
  get(name) {
    const key = name.toLowerCase();
    return this._commands.get(key)
      || this._commands.get(this._aliases.get(key))
      || null;
  }

  /**
   * Hapus command dari registry beserta alias-nya.
   * @param {string} name
   * @returns {boolean}
   */
  delete(name) {
    const key = name.toLowerCase();
    const entry = this._commands.get(key);
    if (!entry) return false;
    for (const a of (entry.aliases || entry.alias || [])) this._aliases.delete(a);
    this._commands.delete(key);
    for (const botConfig of this._perBotConfig.values()) botConfig.delete(key);
    for (const groupConfig of this._perGroupConfig.values()) groupConfig.delete(key);
    return true;
  }

  /**
   * Semua command sebagai array.
   * @returns {object[]}
   */
  all() {
    return [...this._commands.values()];
  }

  /**
   * Filter command.
   * @param {function} predicate
   * @returns {object[]}
   */
  filter(predicate) {
    return this.all().filter(predicate);
  }

  /**
   * Cek apakah command terdaftar.
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    const key = name.toLowerCase();
    return this._commands.has(key) || this._aliases.has(key);
  }

  /**
   * Jumlah command yang terdaftar.
   * @returns {number}
   */
  size() {
    return this._commands.size;
  }

  /**
   * Semua nama command yang terdaftar.
   * @returns {Set<string>}
   */
  names() {
    return new Set(this._commands.keys());
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
   * Set status enabled command secara global.
   * @param {string} name
   * @param {boolean} enabled
   * @returns {object|null} updated entry
   */
  setEnabled(name, enabled) {
    const entry = this.get(name);
    if (!entry) return null;
    entry.enabled = enabled;
    entry.status = enabled ? COMMAND_STATUS.LOADED : COMMAND_STATUS.DISABLED;
    return entry;
  }

  /**
   * Set status error pada command.
   * @param {string} name
   * @param {string} errorMsg
   */
  setError(name, errorMsg) {
    const entry = this.get(name);
    if (!entry) return null;
    entry.status = COMMAND_STATUS.ERROR;
    entry.lastError = errorMsg;
    return entry;
  }

  // ─────────────────────────────────────────────
  // Per-Bot Config
  // ─────────────────────────────────────────────

  setPerBot(botId, commandName, config) {
    const key = String(botId);
    if (!this._perBotConfig.has(key)) this._perBotConfig.set(key, new Map());
    const botMap = this._perBotConfig.get(key);
    const cmdKey = commandName.toLowerCase();
    const existing = botMap.get(cmdKey) || {};
    botMap.set(cmdKey, { ...existing, ...config });
    return botMap.get(cmdKey);
  }

  getPerBot(botId, commandName) {
    const botMap = this._perBotConfig.get(String(botId));
    if (!botMap) return null;
    return botMap.get(commandName.toLowerCase()) || null;
  }

  isEnabledForBot(botId, commandName) {
    const globalEntry = this.get(commandName);
    if (!globalEntry) return false;
    const perBotConf = this.getPerBot(botId, commandName);
    if (perBotConf !== null && typeof perBotConf.enabled === 'boolean') {
      return perBotConf.enabled;
    }
    return globalEntry.enabled !== false;
  }

  allForBot(botId) {
    return this.all().map((entry) => ({
      ...entry,
      enabledForBot: this.isEnabledForBot(botId, entry.name)
    }));
  }

  // ─────────────────────────────────────────────
  // Per-Group Config
  // ─────────────────────────────────────────────

  setPerGroup(groupJid, commandName, config) {
    const key = String(groupJid);
    if (!this._perGroupConfig.has(key)) this._perGroupConfig.set(key, new Map());
    const groupMap = this._perGroupConfig.get(key);
    const cmdKey = commandName.toLowerCase();
    const existing = groupMap.get(cmdKey) || {};
    groupMap.set(cmdKey, { ...existing, ...config });
    return groupMap.get(cmdKey);
  }

  getPerGroup(groupJid, commandName) {
    const groupMap = this._perGroupConfig.get(String(groupJid));
    if (!groupMap) return null;
    return groupMap.get(commandName.toLowerCase()) || null;
  }

  isEnabledForGroup(groupJid, commandName) {
    const globalEntry = this.get(commandName);
    if (!globalEntry) return false;
    const perGroupConf = this.getPerGroup(groupJid, commandName);
    if (perGroupConf !== null && typeof perGroupConf.enabled === 'boolean') {
      return perGroupConf.enabled;
    }
    return globalEntry.enabled !== false;
  }

  // ─────────────────────────────────────────────
  // Per-User Config (Whitelist / Blacklist / Premium / VIP)
  // ─────────────────────────────────────────────

  setPerUser(userJid, commandName, config) {
    const key = String(userJid);
    if (!this._perUserConfig.has(key)) this._perUserConfig.set(key, new Map());
    const userMap = this._perUserConfig.get(key);
    const cmdKey = commandName.toLowerCase();
    const existing = userMap.get(cmdKey) || {};
    userMap.set(cmdKey, { ...existing, ...config });
    return userMap.get(cmdKey);
  }

  getPerUser(userJid, commandName) {
    const userMap = this._perUserConfig.get(String(userJid));
    if (!userMap) return null;
    return userMap.get(commandName.toLowerCase()) || null;
  }

  /**
   * Cek apakah user di-blacklist dari command ini.
   * @param {string} userJid
   * @param {string} commandName
   * @returns {boolean}
   */
  isBlacklisted(userJid, commandName) {
    const conf = this.getPerUser(userJid, commandName);
    return conf?.blacklisted === true;
  }

  /**
   * Cek apakah user di-whitelist (boleh bypass restrictions).
   * @param {string} userJid
   * @param {string} commandName
   * @returns {boolean}
   */
  isWhitelisted(userJid, commandName) {
    const conf = this.getPerUser(userJid, commandName);
    return conf?.whitelisted === true;
  }

  /**
   * Cek apakah user adalah premium.
   * @param {string} userJid
   * @returns {boolean}
   */
  isPremium(userJid) {
    const userMap = this._perUserConfig.get(String(userJid));
    if (!userMap) return false;
    for (const [, conf] of userMap) {
      if (conf.premium === true) return true;
    }
    return false;
  }

  /**
   * Cek apakah user adalah VIP.
   * @param {string} userJid
   * @returns {boolean}
   */
  isVIP(userJid) {
    const userMap = this._perUserConfig.get(String(userJid));
    if (!userMap) return false;
    for (const [, conf] of userMap) {
      if (conf.vip === true) return true;
    }
    return false;
  }

  // ─────────────────────────────────────────────
  // Statistics
  // ─────────────────────────────────────────────

  _initStats() {
    return {
      total: 0,
      success: 0,
      failed: 0,
      totalTime: 0,
      lastExecute: null,
      today: 0,
      todayDate: new Date().toDateString()
    };
  }

  /**
   * Catat eksekusi command.
   * @param {string} name
   * @param {{ success: boolean, executionTime: number }} result
   */
  recordExecution(name, { success = true, executionTime = 0 } = {}) {
    const key = name.toLowerCase();
    if (!this._stats.has(key)) this._stats.set(key, this._initStats());
    const stat = this._stats.get(key);

    // Reset today counter jika hari berbeda
    const today = new Date().toDateString();
    if (stat.todayDate !== today) {
      stat.today = 0;
      stat.todayDate = today;
    }

    stat.total += 1;
    stat.today += 1;
    if (success) stat.success += 1;
    else stat.failed += 1;
    stat.totalTime += executionTime;
    stat.lastExecute = new Date().toISOString();
  }

  /**
   * Ambil statistik satu command.
   * @param {string} name
   * @returns {object}
   */
  getStats(name) {
    const key = name.toLowerCase();
    const stat = this._stats.get(key) || this._initStats();
    return {
      ...stat,
      averageTime: stat.total > 0 ? Math.round(stat.totalTime / stat.total) : 0,
      successRate: stat.total > 0 ? Math.round((stat.success / stat.total) * 100) : 0
    };
  }

  /**
   * Ambil statistik semua command.
   * @returns {object[]}
   */
  getAllStats() {
    const result = [];
    for (const [name] of this._commands) {
      result.push({ name, ...this.getStats(name) });
    }
    return result;
  }

  /**
   * Ambil command terpopuler.
   * @param {number} limit
   * @returns {object[]}
   */
  getTopCommands(limit = 10) {
    return this.getAllStats()
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }

  // ─────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────

  /**
   * Cari command berdasarkan query (name, alias, category, description, author, tags).
   * @param {string} query
   * @returns {object[]}
   */
  search(query) {
    const q = String(query).toLowerCase();
    return this.filter((entry) =>
      entry.name.includes(q) ||
      (entry.aliases || entry.alias || []).some((a) => a.includes(q)) ||
      (entry.category || '').toLowerCase().includes(q) ||
      (entry.description || '').toLowerCase().includes(q) ||
      (entry.author || '').toLowerCase().includes(q) ||
      (entry.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }

  // ─────────────────────────────────────────────
  // Snapshot (untuk API/Dashboard — tanpa execute function)
  // ─────────────────────────────────────────────

  /**
   * Return snapshot command tanpa method execute (safe untuk JSON/API).
   * @param {string|null} botId
   * @returns {object[]}
   */
  snapshot(botId = null) {
    const list = botId ? this.allForBot(botId) : this.all();
    return list.map(({ execute, onLoad, onUnload, onReload, onEnable, onDisable, ...meta }) => ({
      ...meta,
      hasExecute: typeof execute === 'function',
      statistics: this.getStats(meta.name)
    }));
  }

  /**
   * Per-bot config semua (untuk debug).
   * @returns {object}
   */
  getPerBotAll() {
    const result = {};
    for (const [botId, botMap] of this._perBotConfig.entries()) {
      result[botId] = Object.fromEntries(botMap.entries());
    }
    return result;
  }
}
