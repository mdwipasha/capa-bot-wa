/**
 * PermissionManager
 * -----------------
 * Sistem permission berlapis untuk command.
 *
 * Tier permission (urutan dari paling tinggi):
 *   Owner → Admin → Moderator → Premium → VIP → Group → Private → Public
 *
 * Logic:
 * 1. Cek blacklist dulu (hard block)
 * 2. Cek whitelist (bypass semua restriction)
 * 3. Cek ownerOnly
 * 4. Cek groupOnly / privateOnly
 * 5. Cek adminOnly
 * 6. Cek premiumOnly
 * 7. Cek VIP
 * 8. Cek custom permissions
 */

export class PermissionManager {
  /**
   * @param {object} options
   * @param {string} options.ownerNumber - nomor owner
   * @param {import('./CommandRegistry.js').CommandRegistry} options.registry - untuk cek per-user config
   */
  constructor({ ownerNumber = '', registry = null } = {}) {
    this.ownerNumber = String(ownerNumber);
    this.registry = registry;

    /**
     * Custom permission resolvers: { permissionName: async (ctx) => boolean }
     * @type {Map<string, function>}
     */
    this._customResolvers = new Map();
  }

  // ─────────────────────────────────────────────
  // Main Check
  // ─────────────────────────────────────────────

  /**
   * Periksa apakah eksekusi command diizinkan.
   *
   * @param {object} ctx
   * @param {object} ctx.command - command object
   * @param {string} ctx.senderJid - JID pengirim (full, misal 6281234567890@s.whatsapp.net)
   * @param {string} ctx.senderNumber - nomor tanpa @ (misal 6281234567890)
   * @param {string|null} ctx.groupJid - JID grup (null jika private)
   * @param {Set<string>} [ctx.admins] - Set admin JID dalam grup
   * @param {string|null} [ctx.botId] - ID bot session
   * @returns {Promise<{ allowed: boolean, reason: string|null }>}
   */
  async check(ctx) {
    const {
      command,
      senderJid,
      senderNumber,
      groupJid = null,
      admins = new Set(),
      botId = null
    } = ctx;

    const isGroup = Boolean(groupJid);
    const isOwner = this._isOwner(senderNumber);

    // ── 1. Blacklist check (hard block) ──────────────
    if (this.registry?.isBlacklisted(senderJid, command.name)) {
      return this._deny('Kamu tidak diizinkan menggunakan command ini.');
    }

    // ── 2. Whitelist check (bypass semua restriction) ──
    if (this.registry?.isWhitelisted(senderJid, command.name)) {
      return this._allow();
    }

    // ── 3. Owner only ─────────────────────────────────
    if (command.ownerOnly && !isOwner) {
      return this._deny('Command ini khusus untuk owner bot.');
    }

    // Owner bypass semua restriction di bawah ini
    if (isOwner) return this._allow();

    // ── 4. Group / Private restriction ───────────────
    if (command.groupOnly && !isGroup) {
      return this._deny('Command ini hanya bisa digunakan di grup.');
    }
    if (command.privateOnly && isGroup) {
      return this._deny('Command ini hanya bisa digunakan di private chat.');
    }

    // ── 5. Admin only ─────────────────────────────────
    if (command.adminOnly) {
      if (!isGroup) return this._deny('Command ini hanya untuk admin grup.');
      const senderIsAdmin = this._isAdmin(senderJid, senderNumber, admins);
      if (!senderIsAdmin) return this._deny('Command ini hanya untuk admin grup.');
    }

    // ── 6. Premium only ───────────────────────────────
    if (command.premiumOnly) {
      const isPremium = this.registry?.isPremium(senderJid) || false;
      if (!isPremium) return this._deny('Command ini khusus untuk pengguna premium.');
    }

    // ── 7. Custom permissions ─────────────────────────
    if (Array.isArray(command.permissions) && command.permissions.length > 0) {
      for (const perm of command.permissions) {
        const result = await this._checkCustomPermission(perm, ctx);
        if (!result.allowed) return result;
      }
    }

    return this._allow();
  }

  // ─────────────────────────────────────────────
  // Per-Bot Command Availability
  // ─────────────────────────────────────────────

  /**
   * Cek apakah command tersedia untuk bot tertentu.
   * @param {string} botId
   * @param {string} commandName
   * @returns {boolean}
   */
  isAvailableForBot(botId, commandName) {
    if (!this.registry) return true;
    return this.registry.isEnabledForBot(botId, commandName);
  }

  /**
   * Cek apakah command tersedia untuk grup tertentu.
   * @param {string} groupJid
   * @param {string} commandName
   * @returns {boolean}
   */
  isAvailableForGroup(groupJid, commandName) {
    if (!this.registry) return true;
    return this.registry.isEnabledForGroup(groupJid, commandName);
  }

  // ─────────────────────────────────────────────
  // Custom Permission Resolver
  // ─────────────────────────────────────────────

  /**
   * Register custom permission resolver.
   * @param {string} name - nama permission (misal 'moderator', 'vip')
   * @param {function} resolver - async (ctx) => boolean
   */
  registerPermission(name, resolver) {
    if (typeof resolver !== 'function') throw new Error('Resolver harus berupa function.');
    this._customResolvers.set(name.toLowerCase(), resolver);
  }

  /**
   * Hapus custom permission resolver.
   * @param {string} name
   */
  unregisterPermission(name) {
    this._customResolvers.delete(name.toLowerCase());
  }

  /**
   * Cek semua custom resolver yang terdaftar.
   * @returns {string[]}
   */
  listPermissions() {
    return [...this._customResolvers.keys()];
  }

  // ─────────────────────────────────────────────
  // Internal Helpers
  // ─────────────────────────────────────────────

  /**
   * Cek apakah sender adalah owner.
   * @param {string} senderNumber
   * @returns {boolean}
   */
  _isOwner(senderNumber) {
    if (!this.ownerNumber) return false;
    return String(senderNumber).replace(/\D/g, '') === this.ownerNumber.replace(/\D/g, '');
  }

  /**
   * Cek apakah sender adalah admin grup.
   * @param {string} senderJid
   * @param {string} senderNumber
   * @param {Set<string>} admins
   * @returns {boolean}
   */
  _isAdmin(senderJid, senderNumber, admins) {
    if (admins.has(senderJid)) return true;
    // Cek berbagai format JID
    for (const admin of admins) {
      if (admin.includes(senderNumber)) return true;
    }
    return false;
  }

  /**
   * Jalankan custom permission resolver.
   * @param {string} permName
   * @param {object} ctx
   * @returns {Promise<{ allowed: boolean, reason: string|null }>}
   */
  async _checkCustomPermission(permName, ctx) {
    const resolver = this._customResolvers.get(permName.toLowerCase());
    if (!resolver) return this._allow(); // unknown permission → allow

    try {
      const result = await resolver(ctx);
      if (result === false) {
        return this._deny(`Permission "${permName}" tidak terpenuhi.`);
      }
      if (result && typeof result === 'object' && result.allowed === false) {
        return result;
      }
      return this._allow();
    } catch (err) {
      // Jika resolver error → deny
      return this._deny(`Permission check error: ${err.message}`);
    }
  }

  _allow() {
    return { allowed: true, reason: null };
  }

  _deny(reason) {
    return { allowed: false, reason };
  }
}
