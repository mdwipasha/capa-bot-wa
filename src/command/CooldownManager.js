/**
 * CooldownManager
 * ---------------
 * Sistem cooldown profesional dengan support per:
 *   - User   : cooldown berbeda per pengguna
 *   - Group  : cooldown berbeda per grup
 *   - Command: cooldown per command
 *   - Bot    : cooldown global per bot session
 *
 * Semua cooldown disimpan di memory (Map) dengan auto-cleanup
 * untuk mencegah memory leak.
 */

export class CooldownManager {
  constructor() {
    /**
     * Map key → { expireAt: number }
     * Key format: "{scope}:{target}:{commandName}"
     * @type {Map<string, number>}
     */
    this._cooldowns = new Map();

    /** Interval auto-cleanup setiap 5 menit */
    this._cleanupInterval = setInterval(() => this._cleanup(), 5 * 60 * 1000);

    /** Pastikan interval tidak menghambat process exit */
    if (this._cleanupInterval.unref) this._cleanupInterval.unref();
  }

  // ─────────────────────────────────────────────
  // Check & Set Cooldown
  // ─────────────────────────────────────────────

  /**
   * Cek apakah target sedang dalam cooldown.
   * Jika tidak dalam cooldown, set cooldown baru.
   *
   * @param {object} options
   * @param {string} options.commandName - nama command
   * @param {string} options.userJid - JID pengguna
   * @param {string|null} [options.groupJid] - JID grup (null jika private)
   * @param {string|null} [options.botId] - ID bot session
   * @param {object} options.command - command object (untuk ambil cooldown)
   * @param {number} [options.defaultCooldown=3] - cooldown default dalam detik
   * @returns {{ allowed: boolean, remainingMs: number, remainingSec: number }}
   */
  check({
    commandName,
    userJid,
    groupJid = null,
    botId = null,
    command = {},
    defaultCooldown = 3
  }) {
    const cooldownSec = this._resolveCooldown(command, defaultCooldown);
    if (cooldownSec <= 0) return { allowed: true, remainingMs: 0, remainingSec: 0 };

    const cooldownMs = cooldownSec * 1000;
    const now = Date.now();

    // Cek user cooldown (paling ketat)
    const userKey = this._key('user', userJid, commandName);
    const userRemaining = this._remaining(userKey, now);
    if (userRemaining > 0) {
      return {
        allowed: false,
        remainingMs: userRemaining,
        remainingSec: Math.ceil(userRemaining / 1000),
        scope: 'user'
      };
    }

    // Cek group cooldown (jika di grup)
    if (groupJid) {
      const groupKey = this._key('group', groupJid, commandName);
      const groupRemaining = this._remaining(groupKey, now);
      if (groupRemaining > 0) {
        return {
          allowed: false,
          remainingMs: groupRemaining,
          remainingSec: Math.ceil(groupRemaining / 1000),
          scope: 'group'
        };
      }
    }

    // Cek bot cooldown (global per bot)
    if (botId && command.botCooldown) {
      const botKey = this._key('bot', botId, commandName);
      const botRemaining = this._remaining(botKey, now);
      if (botRemaining > 0) {
        return {
          allowed: false,
          remainingMs: botRemaining,
          remainingSec: Math.ceil(botRemaining / 1000),
          scope: 'bot'
        };
      }
    }

    // Set cooldown baru
    const expireAt = now + cooldownMs;
    this._cooldowns.set(userKey, expireAt);
    if (groupJid) this._cooldowns.set(this._key('group', groupJid, commandName), expireAt);
    if (botId && command.botCooldown) {
      this._cooldowns.set(this._key('bot', botId, commandName), now + (command.botCooldown * 1000));
    }

    return { allowed: true, remainingMs: 0, remainingSec: 0 };
  }

  /**
   * Reset cooldown untuk satu user + command.
   * @param {string} userJid
   * @param {string} commandName
   */
  reset(userJid, commandName) {
    this._cooldowns.delete(this._key('user', userJid, commandName));
  }

  /**
   * Reset semua cooldown untuk satu command.
   * @param {string} commandName
   */
  resetCommand(commandName) {
    const suffix = `:${commandName.toLowerCase()}`;
    for (const key of this._cooldowns.keys()) {
      if (key.endsWith(suffix)) this._cooldowns.delete(key);
    }
  }

  /**
   * Reset semua cooldown untuk satu user.
   * @param {string} userJid
   */
  resetUser(userJid) {
    const prefix = `user:${userJid}:`;
    for (const key of this._cooldowns.keys()) {
      if (key.startsWith(prefix)) this._cooldowns.delete(key);
    }
  }

  /**
   * Hapus semua cooldown (clear all).
   */
  clear() {
    this._cooldowns.clear();
  }

  /**
   * Jumlah cooldown aktif.
   * @returns {number}
   */
  size() {
    return this._cooldowns.size;
  }

  // ─────────────────────────────────────────────
  // Internal Helpers
  // ─────────────────────────────────────────────

  /**
   * Buat key untuk cooldown map.
   * @param {'user'|'group'|'bot'|'command'} scope
   * @param {string} target
   * @param {string} commandName
   * @returns {string}
   */
  _key(scope, target, commandName) {
    return `${scope}:${target}:${commandName.toLowerCase()}`;
  }

  /**
   * Hitung sisa waktu cooldown dalam ms.
   * @param {string} key
   * @param {number} now
   * @returns {number} sisa ms (0 jika tidak dalam cooldown)
   */
  _remaining(key, now) {
    const expireAt = this._cooldowns.get(key);
    if (!expireAt) return 0;
    const remaining = expireAt - now;
    if (remaining <= 0) {
      this._cooldowns.delete(key);
      return 0;
    }
    return remaining;
  }

  /**
   * Resolve nilai cooldown dari command.
   * Priority: command.cooldown → defaultCooldown
   * @param {object} command
   * @param {number} defaultCooldown
   * @returns {number} cooldown dalam detik
   */
  _resolveCooldown(command, defaultCooldown) {
    if (typeof command.cooldown === 'number' && command.cooldown >= 0) {
      return command.cooldown;
    }
    return defaultCooldown;
  }

  /**
   * Bersihkan cooldown yang sudah expired (auto-cleanup).
   * @private
   */
  _cleanup() {
    const now = Date.now();
    for (const [key, expireAt] of this._cooldowns) {
      if (expireAt <= now) this._cooldowns.delete(key);
    }
  }

  /**
   * Stop cleanup interval.
   */
  destroy() {
    clearInterval(this._cleanupInterval);
    this._cooldowns.clear();
  }
}
