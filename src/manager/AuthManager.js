import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

// ─────────────────────────────────────────────
// Permission Registry — Granular RBAC
// ─────────────────────────────────────────────

const ROLE_HIERARCHY = {
  viewer: 0,
  developer: 1,
  operator: 2,
  admin: 3,
  owner: 4
};

/**
 * Default permissions per role.
 * Higher roles inherit all lower-role permissions automatically.
 */
const DEFAULT_PERMISSIONS = {
  owner: [
    'bot.view', 'bot.create', 'bot.start', 'bot.stop', 'bot.delete',
    'message.send', 'message.broadcast',
    'plugin.view', 'plugin.manage',
    'command.view', 'command.manage',
    'session.view', 'session.manage',
    'config.view', 'config.edit',
    'user.view', 'user.manage', 'user.delete',
    'system.view', 'system.manage',
    'queue.view', 'queue.manage',
    'scheduler.view', 'scheduler.manage',
    'audit.view',
    'ws.logs', 'ws.system'
  ],
  admin: [
    'bot.view', 'bot.create', 'bot.start', 'bot.stop', 'bot.delete',
    'message.send', 'message.broadcast',
    'plugin.view', 'plugin.manage',
    'command.view', 'command.manage',
    'session.view', 'session.manage',
    'config.view', 'config.edit',
    'user.view', 'user.manage',
    'system.view', 'system.manage',
    'queue.view', 'queue.manage',
    'scheduler.view', 'scheduler.manage',
    'audit.view',
    'ws.logs', 'ws.system'
  ],
  operator: [
    'bot.view', 'bot.start', 'bot.stop',
    'message.send',
    'plugin.view',
    'command.view',
    'session.view', 'session.manage',
    'config.view',
    'system.view',
    'queue.view', 'queue.manage',
    'scheduler.view', 'scheduler.manage'
  ],
  viewer: [
    'bot.view',
    'plugin.view',
    'command.view',
    'session.view',
    'config.view',
    'system.view',
    'queue.view',
    'scheduler.view'
  ],
  developer: [
    'bot.view',
    'message.send',
    'plugin.view', 'plugin.manage',
    'command.view', 'command.manage',
    'session.view',
    'config.view',
    'system.view',
    'queue.view',
    'scheduler.view',
    'ws.logs', 'ws.system'
  ]
};

// ─────────────────────────────────────────────
// Password Policy Defaults
// ─────────────────────────────────────────────

const DEFAULT_PASSWORD_POLICY = {
  minLength: 6,
  maxLength: 128,
  requireUppercase: false,
  requireLowercase: false,
  requireDigit: false,
  requireSpecial: false,
  historyCount: 3,         // number of past passwords to check
  maxAgeDays: 0            // 0 = no expiry
};

// ─────────────────────────────────────────────
// Lockout Defaults
// ─────────────────────────────────────────────

const DEFAULT_LOCKOUT = {
  maxAttempts: 5,
  lockDurationMs: 15 * 60 * 1000,  // 15 minutes
  resetAfterMs: 30 * 60 * 1000     // reset counter after 30 min of no attempts
};

// ─────────────────────────────────────────────
// Session Defaults
// ─────────────────────────────────────────────

const DEFAULT_SESSION_POLICY = {
  maxConcurrentSessions: 5
};

// ─────────────────────────────────────────────
// AuthManager — Singleton
// ─────────────────────────────────────────────

class AuthManager extends EventEmitter {
  constructor() {
    super();
    this.db = null;
    this.initialized = false;

    // Permission registry
    this._permissions = structuredClone(DEFAULT_PERMISSIONS);
    this._roleHierarchy = { ...ROLE_HIERARCHY };

    // Token blacklist (in-memory, cleared on restart)
    this._tokenBlacklist = new Map(); // jti → expireAt

    // Password policy
    this._passwordPolicy = { ...DEFAULT_PASSWORD_POLICY };

    // Lockout policy
    this._lockoutPolicy = { ...DEFAULT_LOCKOUT };

    // Session policy
    this._sessionPolicy = { ...DEFAULT_SESSION_POLICY };

    // Cleanup interval for expired blacklisted tokens
    this._cleanupInterval = null;
  }

  // ───────────────────────────────────────────
  // Initialization
  // ───────────────────────────────────────────

  /**
   * Initialize AuthManager with database reference.
   * @param {object} db — Database instance
   */
  async init(db) {
    if (this.initialized) return this;

    this.db = db;

    // Ensure auth-related collections exist in database
    await this.db.update((data) => {
      if (!data.loginHistory) data.loginHistory = [];
      if (!data.apiUsers) data.apiUsers = {};

      // Migrate existing users: moderator → operator
      for (const userId of Object.keys(data.apiUsers)) {
        if (data.apiUsers[userId].role === 'moderator') {
          data.apiUsers[userId].role = 'operator';
          logger.info(`[auth] Migrated user "${data.apiUsers[userId].username}" role: moderator → operator`);
        }
        // Ensure lockout field exists
        if (!data.apiUsers[userId].lockout) {
          data.apiUsers[userId].lockout = {
            locked: false,
            failedAttempts: 0,
            lockUntil: null,
            reason: null
          };
        }
        // Ensure activeSessions field
        if (!data.apiUsers[userId].activeSessions) {
          data.apiUsers[userId].activeSessions = [];
        }
        // Ensure passwordHistory
        if (!data.apiUsers[userId].passwordHistory) {
          data.apiUsers[userId].passwordHistory = [];
        }
        // Ensure passwordChangedAt
        if (!data.apiUsers[userId].passwordChangedAt) {
          data.apiUsers[userId].passwordChangedAt = data.apiUsers[userId].createdAt || new Date().toISOString();
        }
      }
    });

    // Start cleanup interval for expired blacklisted tokens (every 5 min)
    this._cleanupInterval = setInterval(() => this._cleanupBlacklist(), 5 * 60 * 1000);

    this.initialized = true;
    logger.info('[auth] AuthManager initialized — permission registry loaded');
    this.emit('initialized');
    return this;
  }

  // ───────────────────────────────────────────
  // Permission System
  // ───────────────────────────────────────────

  /**
   * Check if a role has a specific permission.
   * @param {string} role
   * @param {string} permission
   * @returns {boolean}
   */
  hasPermission(role, permission) {
    const perms = this._permissions[role];
    if (!perms) return false;
    return perms.includes(permission);
  }

  /**
   * Get all permissions for a role.
   * @param {string} role
   * @returns {string[]}
   */
  getPermissions(role) {
    return this._permissions[role] ? [...this._permissions[role]] : [];
  }

  /**
   * Get all available roles.
   * @returns {string[]}
   */
  getRoles() {
    return Object.keys(this._roleHierarchy);
  }

  /**
   * Get role hierarchy level.
   * @param {string} role
   * @returns {number}
   */
  getRoleLevel(role) {
    return this._roleHierarchy[role] ?? -1;
  }

  /**
   * Check if roleA >= roleB in hierarchy.
   * @param {string} roleA
   * @param {string} roleB
   * @returns {boolean}
   */
  isRoleAtLeast(roleA, roleB) {
    return this.getRoleLevel(roleA) >= this.getRoleLevel(roleB);
  }

  /**
   * Get complete permission matrix.
   * @returns {object}
   */
  getPermissionMatrix() {
    return structuredClone(this._permissions);
  }

  // ───────────────────────────────────────────
  // Login History & Tracking
  // ───────────────────────────────────────────

  /**
   * Record a login attempt.
   * @param {string} userId
   * @param {{ success: boolean, ip?: string, userAgent?: string, method?: string }} details
   */
  async recordLoginAttempt(userId, { success, ip = 'unknown', userAgent = 'unknown', method = 'jwt' }) {
    const entry = {
      id: randomUUID(),
      userId,
      success,
      ip,
      userAgent,
      method,
      timestamp: new Date().toISOString()
    };

    await this.db.update((data) => {
      if (!data.loginHistory) data.loginHistory = [];
      data.loginHistory.push(entry);

      // Keep last 5000 entries globally
      if (data.loginHistory.length > 5000) {
        data.loginHistory = data.loginHistory.slice(-5000);
      }
    });

    this.emit('login_attempt', entry);

    // Handle failed attempts for lockout
    if (!success) {
      await this._handleFailedAttempt(userId);
    } else {
      await this._resetFailedAttempts(userId);
    }
  }

  /**
   * Get login history for a user.
   * @param {string} userId
   * @param {{ page?: number, limit?: number }} options
   * @returns {{ history: object[], total: number, page: number, limit: number }}
   */
  async getLoginHistory(userId, { page = 1, limit = 50 } = {}) {
    const data = await this.db.read();
    const history = (data.loginHistory || [])
      .filter((e) => e.userId === userId)
      .slice()
      .reverse();
    const total = history.length;
    const sliced = history.slice((page - 1) * limit, page * limit);
    return { history: sliced, total, page, limit };
  }

  /**
   * Get all login history (admin view).
   * @param {{ page?: number, limit?: number }} options
   */
  async getAllLoginHistory({ page = 1, limit = 50 } = {}) {
    const data = await this.db.read();
    const history = (data.loginHistory || []).slice().reverse();
    const total = history.length;
    const sliced = history.slice((page - 1) * limit, page * limit);
    return { history: sliced, total, page, limit };
  }

  // ───────────────────────────────────────────
  // Account Lockout
  // ───────────────────────────────────────────

  /**
   * Check if user account is locked.
   * @param {string} userId
   * @returns {{ locked: boolean, reason?: string, unlockAt?: string }}
   */
  async isAccountLocked(userId) {
    const data = await this.db.read();
    const user = data.apiUsers?.[userId];
    if (!user) return { locked: false };

    const lockout = user.lockout || {};

    if (!lockout.locked) return { locked: false };

    // Check if auto-unlock time has passed
    if (lockout.lockUntil && new Date(lockout.lockUntil) <= new Date()) {
      await this.unlockAccount(userId, 'auto');
      return { locked: false };
    }

    return {
      locked: true,
      reason: lockout.reason || 'Too many failed attempts',
      unlockAt: lockout.lockUntil || null
    };
  }

  /**
   * Lock a user account.
   * @param {string} userId
   * @param {string} reason
   * @param {number|null} durationMs — null = permanent lock
   */
  async lockAccount(userId, reason = 'Manual lock', durationMs = null) {
    await this.db.update((data) => {
      if (!data.apiUsers?.[userId]) return;
      data.apiUsers[userId].lockout = {
        locked: true,
        failedAttempts: data.apiUsers[userId].lockout?.failedAttempts || 0,
        lockUntil: durationMs ? new Date(Date.now() + durationMs).toISOString() : null,
        reason
      };
    });

    this.emit('account_locked', { userId, reason });
    logger.warn(`[auth] Account locked: userId=${userId}, reason="${reason}"`);

    // Audit log
    await this._auditLog({
      action: 'account.locked',
      userId,
      details: { reason, permanent: !durationMs }
    });
  }

  /**
   * Unlock a user account.
   * @param {string} userId
   * @param {string} unlockedBy
   */
  async unlockAccount(userId, unlockedBy = 'admin') {
    await this.db.update((data) => {
      if (!data.apiUsers?.[userId]) return;
      data.apiUsers[userId].lockout = {
        locked: false,
        failedAttempts: 0,
        lockUntil: null,
        reason: null
      };
    });

    this.emit('account_unlocked', { userId, unlockedBy });
    logger.info(`[auth] Account unlocked: userId=${userId}, by=${unlockedBy}`);

    await this._auditLog({
      action: 'account.unlocked',
      userId,
      details: { unlockedBy }
    });
  }

  /**
   * Handle failed login attempt — increment counter, lock if threshold exceeded.
   * @private
   */
  async _handleFailedAttempt(userId) {
    const data = await this.db.read();
    const user = data.apiUsers?.[userId];
    if (!user) return;

    const lockout = user.lockout || { locked: false, failedAttempts: 0, lockUntil: null, reason: null };
    lockout.failedAttempts = (lockout.failedAttempts || 0) + 1;

    if (lockout.failedAttempts >= this._lockoutPolicy.maxAttempts) {
      await this.lockAccount(userId, 'Too many failed login attempts', this._lockoutPolicy.lockDurationMs);
    } else {
      await this.db.update((d) => {
        if (d.apiUsers?.[userId]) {
          d.apiUsers[userId].lockout = lockout;
        }
      });
    }
  }

  /**
   * Reset failed attempts on successful login.
   * @private
   */
  async _resetFailedAttempts(userId) {
    await this.db.update((data) => {
      if (!data.apiUsers?.[userId]) return;
      const lockout = data.apiUsers[userId].lockout || {};
      lockout.failedAttempts = 0;
      data.apiUsers[userId].lockout = lockout;
    });
  }

  // ───────────────────────────────────────────
  // Token Blacklist
  // ───────────────────────────────────────────

  /**
   * Add a JWT ID to the blacklist (used on logout/revoke).
   * @param {string} jti — JWT ID
   * @param {number} expiresInMs — time until token naturally expires
   */
  blacklistToken(jti, expiresInMs = 15 * 60 * 1000) {
    if (!jti) return;
    this._tokenBlacklist.set(jti, Date.now() + expiresInMs);
    this.emit('token_blacklisted', { jti });
  }

  /**
   * Check if a token JTI is blacklisted.
   * @param {string} jti
   * @returns {boolean}
   */
  isTokenBlacklisted(jti) {
    if (!jti) return false;
    const expireAt = this._tokenBlacklist.get(jti);
    if (!expireAt) return false;
    if (Date.now() > expireAt) {
      this._tokenBlacklist.delete(jti);
      return false;
    }
    return true;
  }

  /**
   * Cleanup expired entries from blacklist.
   * @private
   */
  _cleanupBlacklist() {
    const now = Date.now();
    let cleaned = 0;
    for (const [jti, expireAt] of this._tokenBlacklist) {
      if (now > expireAt) {
        this._tokenBlacklist.delete(jti);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      logger.debug(`[auth] Cleaned ${cleaned} expired tokens from blacklist`);
    }
  }

  // ───────────────────────────────────────────
  // Session Management
  // ───────────────────────────────────────────

  /**
   * Register a new active session for a user.
   * @param {string} userId
   * @param {{ sessionId: string, ip?: string, userAgent?: string, method?: string }} sessionInfo
   * @returns {string} sessionId
   */
  async registerSession(userId, { sessionId, ip = 'unknown', userAgent = 'unknown', method = 'jwt' }) {
    const session = {
      sessionId: sessionId || randomUUID(),
      ip,
      userAgent,
      method,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    await this.db.update((data) => {
      if (!data.apiUsers?.[userId]) return;
      if (!data.apiUsers[userId].activeSessions) {
        data.apiUsers[userId].activeSessions = [];
      }

      const sessions = data.apiUsers[userId].activeSessions;

      // Enforce max concurrent sessions — remove oldest if over limit
      while (sessions.length >= this._sessionPolicy.maxConcurrentSessions) {
        const removed = sessions.shift();
        if (removed) {
          this.blacklistToken(removed.sessionId, 15 * 60 * 1000);
        }
      }

      sessions.push(session);
    });

    this.emit('session_created', { userId, sessionId: session.sessionId });
    return session.sessionId;
  }

  /**
   * Get active sessions for a user.
   * @param {string} userId
   * @returns {object[]}
   */
  async getActiveSessions(userId) {
    const data = await this.db.read();
    const user = data.apiUsers?.[userId];
    return user?.activeSessions || [];
  }

  /**
   * Revoke a specific session.
   * @param {string} userId
   * @param {string} sessionId
   */
  async revokeSession(userId, sessionId) {
    let revoked = false;
    await this.db.update((data) => {
      if (!data.apiUsers?.[userId]) return;
      const sessions = data.apiUsers[userId].activeSessions || [];
      const idx = sessions.findIndex((s) => s.sessionId === sessionId);
      if (idx >= 0) {
        sessions.splice(idx, 1);
        revoked = true;
      }
    });

    if (revoked) {
      this.blacklistToken(sessionId, 15 * 60 * 1000);
      this.emit('session_revoked', { userId, sessionId });
      logger.info(`[auth] Session revoked: userId=${userId}, sessionId=${sessionId}`);
    }

    return revoked;
  }

  /**
   * Revoke ALL sessions for a user.
   * @param {string} userId
   */
  async revokeAllSessions(userId) {
    await this.db.update((data) => {
      if (!data.apiUsers?.[userId]) return;
      const sessions = data.apiUsers[userId].activeSessions || [];
      for (const s of sessions) {
        this.blacklistToken(s.sessionId, 15 * 60 * 1000);
      }
      data.apiUsers[userId].activeSessions = [];
      // Also clear refresh tokens
      data.apiUsers[userId].refreshTokens = [];
    });

    this.emit('all_sessions_revoked', { userId });
    logger.info(`[auth] All sessions revoked for userId=${userId}`);

    await this._auditLog({
      action: 'sessions.revoked_all',
      userId,
      details: {}
    });
  }

  // ───────────────────────────────────────────
  // Password Policy
  // ───────────────────────────────────────────

  /**
   * Validate a password against the policy.
   * @param {string} password
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validatePasswordPolicy(password) {
    const errors = [];
    const p = this._passwordPolicy;

    if (!password || typeof password !== 'string') {
      return { valid: false, errors: ['Password wajib diisi'] };
    }

    if (password.length < p.minLength) {
      errors.push(`Password minimal ${p.minLength} karakter`);
    }
    if (password.length > p.maxLength) {
      errors.push(`Password maksimal ${p.maxLength} karakter`);
    }
    if (p.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password harus mengandung huruf besar');
    }
    if (p.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password harus mengandung huruf kecil');
    }
    if (p.requireDigit && !/\d/.test(password)) {
      errors.push('Password harus mengandung angka');
    }
    if (p.requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('Password harus mengandung karakter spesial');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check if password was used recently (password history check).
   * @param {string} userId
   * @param {string} newPassword
   * @returns {boolean} true if password was recently used
   */
  async isPasswordReused(userId, newPassword) {
    const data = await this.db.read();
    const user = data.apiUsers?.[userId];
    if (!user) return false;

    const history = user.passwordHistory || [];
    for (const oldHash of history) {
      const match = await bcrypt.compare(newPassword, oldHash);
      if (match) return true;
    }
    return false;
  }

  /**
   * Record password change — store old hash in history.
   * @param {string} userId
   * @param {string} oldPasswordHash
   */
  async recordPasswordChange(userId, oldPasswordHash) {
    await this.db.update((data) => {
      if (!data.apiUsers?.[userId]) return;
      if (!data.apiUsers[userId].passwordHistory) {
        data.apiUsers[userId].passwordHistory = [];
      }
      data.apiUsers[userId].passwordHistory.push(oldPasswordHash);

      // Keep only last N passwords
      const maxHistory = this._passwordPolicy.historyCount;
      if (data.apiUsers[userId].passwordHistory.length > maxHistory) {
        data.apiUsers[userId].passwordHistory = data.apiUsers[userId].passwordHistory.slice(-maxHistory);
      }

      data.apiUsers[userId].passwordChangedAt = new Date().toISOString();
    });

    await this._auditLog({
      action: 'password.changed',
      userId,
      details: {}
    });
  }

  /**
   * Get password policy.
   * @returns {object}
   */
  getPasswordPolicy() {
    return { ...this._passwordPolicy };
  }

  /**
   * Get lockout policy.
   * @returns {object}
   */
  getLockoutPolicy() {
    return { ...this._lockoutPolicy };
  }

  /**
   * Get session policy.
   * @returns {object}
   */
  getSessionPolicy() {
    return { ...this._sessionPolicy };
  }

  // ───────────────────────────────────────────
  // Auth Info (for API response)
  // ───────────────────────────────────────────

  /**
   * Get auth system information.
   * @returns {object}
   */
  getSystemInfo() {
    return {
      roles: this.getRoles(),
      roleHierarchy: { ...this._roleHierarchy },
      permissions: this.getPermissionMatrix(),
      passwordPolicy: this.getPasswordPolicy(),
      lockoutPolicy: this.getLockoutPolicy(),
      sessionPolicy: this.getSessionPolicy(),
      blacklistedTokens: this._tokenBlacklist.size
    };
  }

  // ───────────────────────────────────────────
  // Audit Logging (internal)
  // ───────────────────────────────────────────

  /**
   * @private
   */
  async _auditLog(entry) {
    try {
      await this.db.update((data) => {
        if (!data.auditLogs) data.auditLogs = [];
        data.auditLogs.push({
          id: randomUUID(),
          ...entry,
          timestamp: new Date().toISOString()
        });
        if (data.auditLogs.length > 2000) {
          data.auditLogs = data.auditLogs.slice(-2000);
        }
      });
    } catch {
      logger.error('[auth] Failed to write audit log');
    }
  }

  // ───────────────────────────────────────────
  // Shutdown
  // ───────────────────────────────────────────

  close() {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }
    this._tokenBlacklist.clear();
    this.initialized = false;
    logger.info('[auth] AuthManager closed');
  }
}

// ─── Export singleton ─────────────────────────
export const authManager = new AuthManager();
export { ROLE_HIERARCHY, DEFAULT_PERMISSIONS };
