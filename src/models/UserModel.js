import { db } from '../database/index.js';
import { randomUUID } from 'crypto';

/**
 * UserModel — manages API users stored in the JSON database.
 * Supports roles: owner, admin, operator, viewer, developer
 */
export class UserModel {
  static ROLES = ['owner', 'admin', 'operator', 'viewer', 'developer'];

  static async _read() {
    const data = await db.read();
    if (!data.apiUsers) {
      data.apiUsers = {};
      await db.write();
    }
    return data;
  }

  static async _write() {
    return db.write();
  }

  /**
   * Find user by id.
   */
  static async findById(id) {
    const data = await UserModel._read();
    return data.apiUsers[id] ? { id, ...data.apiUsers[id] } : null;
  }

  /**
   * Find user by username.
   */
  static async findByUsername(username) {
    const data = await UserModel._read();
    const entry = Object.entries(data.apiUsers).find(([, u]) => u.username === username);
    if (!entry) return null;
    return { id: entry[0], ...entry[1] };
  }

  /**
   * Find user by API key.
   */
  static async findByApiKey(apiKey) {
    const data = await UserModel._read();
    const entry = Object.entries(data.apiUsers).find(([, u]) => u.apiKey === apiKey);
    if (!entry) return null;
    return { id: entry[0], ...entry[1] };
  }

  /**
   * Get all users.
   */
  static async findAll() {
    const data = await UserModel._read();
    return Object.entries(data.apiUsers).map(([id, u]) => ({ id, ...u }));
  }

  /**
   * Create a new user.
   * @param {{ username: string, passwordHash: string, role: string, email?: string }} userData
   */
  static async create(userData) {
    const data = await UserModel._read();
    const id = randomUUID();
    const now = new Date().toISOString();
    const user = {
      username: userData.username,
      email: userData.email || '',
      passwordHash: userData.passwordHash,
      role: userData.role || 'viewer',
      apiKey: null,
      refreshTokens: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastLogin: null,
      // Auth System fields
      lockout: {
        locked: false,
        failedAttempts: 0,
        lockUntil: null,
        reason: null
      },
      activeSessions: [],
      passwordHistory: [],
      passwordChangedAt: now
    };
    data.apiUsers[id] = user;
    await UserModel._write();
    return { id, ...user };
  }

  /**
   * Update user fields.
   */
  static async update(id, fields) {
    const data = await UserModel._read();
    if (!data.apiUsers[id]) return null;
    data.apiUsers[id] = {
      ...data.apiUsers[id],
      ...fields,
      updatedAt: new Date().toISOString()
    };
    await UserModel._write();
    return { id, ...data.apiUsers[id] };
  }

  /**
   * Delete user.
   */
  static async delete(id) {
    const data = await UserModel._read();
    if (!data.apiUsers[id]) return false;
    delete data.apiUsers[id];
    await UserModel._write();
    return true;
  }

  /**
   * Store a refresh token for a user.
   */
  static async addRefreshToken(id, token) {
    const data = await UserModel._read();
    if (!data.apiUsers[id]) return;
    const tokens = data.apiUsers[id].refreshTokens || [];
    // keep max 5 refresh tokens per user
    if (tokens.length >= 5) tokens.shift();
    tokens.push(token);
    data.apiUsers[id].refreshTokens = tokens;
    data.apiUsers[id].updatedAt = new Date().toISOString();
    await UserModel._write();
  }

  /**
   * Remove a refresh token.
   */
  static async removeRefreshToken(id, token) {
    const data = await UserModel._read();
    if (!data.apiUsers[id]) return;
    data.apiUsers[id].refreshTokens = (data.apiUsers[id].refreshTokens || []).filter((t) => t !== token);
    data.apiUsers[id].updatedAt = new Date().toISOString();
    await UserModel._write();
  }

  /**
   * Set API key for user.
   */
  static async setApiKey(id, apiKey) {
    return UserModel.update(id, { apiKey });
  }

  /**
   * Update last login timestamp.
   */
  static async updateLastLogin(id) {
    return UserModel.update(id, { lastLogin: new Date().toISOString() });
  }

  /**
   * Record an audit log entry.
   * @param {object} entry
   */
  static async auditLog(entry) {
    const data = await UserModel._read();
    if (!data.auditLogs) data.auditLogs = [];
    data.auditLogs.push({
      id: randomUUID(),
      ...entry,
      timestamp: new Date().toISOString()
    });
    // Keep last 2000 audit entries
    if (data.auditLogs.length > 2000) {
      data.auditLogs = data.auditLogs.slice(-2000);
    }
    await UserModel._write();
  }

  /**
   * Get audit logs with optional pagination.
   */
  static async getAuditLogs({ page = 1, limit = 50 } = {}) {
    const data = await UserModel._read();
    const logs = (data.auditLogs || []).slice().reverse();
    const total = logs.length;
    const sliced = logs.slice((page - 1) * limit, page * limit);
    return { logs: sliced, total, page, limit };
  }

  /**
   * Safe user object (without sensitive fields).
   */
  static sanitize(user) {
    if (!user) return null;
    const safe = { ...user };
    delete safe.passwordHash;
    delete safe.refreshTokens;
    delete safe.passwordHistory;
    return safe;
  }
}
