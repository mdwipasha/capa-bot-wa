import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UserModel } from '../../../models/UserModel.js';
import { ApiResponse } from '../../response/ApiResponse.js';
import { authManager } from '../../../manager/AuthManager.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../../middleware/auth.js';

/**
 * AuthController — handles authentication operations.
 * Delegates to UserModel, AuthManager, and JWT helpers.
 */
export class AuthController {
  constructor(botManager = null) {
    this.botManager = botManager;
  }

  /**
   * POST /auth/login
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const user = await UserModel.findByUsername(username);
      if (!user || !user.isActive) {
        // Record failed attempt if user exists
        if (user) {
          await authManager.recordLoginAttempt(user.id, { success: false, ip, userAgent, method: 'password' });
        }
        return ApiResponse.unauthorized(res, 'Username atau password salah');
      }

      // Check account lockout
      const lockStatus = await authManager.isAccountLocked(user.id);
      if (lockStatus.locked) {
        return ApiResponse.forbidden(res, `Akun terkunci: ${lockStatus.reason}${lockStatus.unlockAt ? `. Unlock at: ${lockStatus.unlockAt}` : ''}`);
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        await authManager.recordLoginAttempt(user.id, { success: false, ip, userAgent, method: 'password' });
        return ApiResponse.unauthorized(res, 'Username atau password salah');
      }

      // Successful login
      const sessionJti = randomUUID();
      const accessToken = generateAccessToken(user.id, user.role, sessionJti);
      const refreshToken = generateRefreshToken(user.id);

      await UserModel.addRefreshToken(user.id, refreshToken);
      await UserModel.updateLastLogin(user.id);

      // Record success + register session
      await authManager.recordLoginAttempt(user.id, { success: true, ip, userAgent, method: 'password' });

      const sessionId = await authManager.registerSession(user.id, {
        sessionId: sessionJti,
        ip,
        userAgent,
        method: 'password'
      });

      return ApiResponse.ok(res, {
        user: UserModel.sanitize(user),
        accessToken,
        refreshToken,
        sessionId,
        expiresIn: '15m'
      }, 'Login berhasil');
    } catch (err) { next(err); }
  }

  /**
   * POST /auth/logout
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken && req.user?.id) {
        await UserModel.removeRefreshToken(req.user.id, refreshToken);
      }

      // Blacklist the current access token JTI
      if (req.tokenJti) {
        const revoked = await authManager.revokeSession(req.user.id, req.tokenJti);
        if (!revoked) authManager.blacklistToken(req.tokenJti, 15 * 60 * 1000);
        authManager.emit('auth.logout', { userId: req.user.id, tokenJti: req.tokenJti });
        if (this.botManager?.eventBus) {
          this.botManager.eventBus.emitEvent('auth.logout', { userId: req.user.id, tokenJti: req.tokenJti });
        }
      }

      return ApiResponse.ok(res, null, 'Logout berhasil');
    } catch (err) { next(err); }
  }

  /**
   * POST /auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const decoded = verifyRefreshToken(refreshToken);
      const user = await UserModel.findById(decoded.userId);

      if (!user || !user.isActive) {
        return ApiResponse.unauthorized(res, 'Refresh token tidak valid');
      }

      // Check account lockout
      const lockStatus = await authManager.isAccountLocked(user.id);
      if (lockStatus.locked) {
        return ApiResponse.forbidden(res, `Akun terkunci: ${lockStatus.reason}`);
      }

      const storedTokens = user.refreshTokens || [];
      if (!storedTokens.includes(refreshToken)) {
        return ApiResponse.unauthorized(res, 'Refresh token tidak ditemukan atau sudah dicabut');
      }

      // Rotate refresh token
      await UserModel.removeRefreshToken(user.id, refreshToken);
      const newRefreshToken = generateRefreshToken(user.id);
      await UserModel.addRefreshToken(user.id, newRefreshToken);

      const accessToken = generateAccessToken(user.id, user.role);
      return ApiResponse.ok(res, {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: '15m'
      }, 'Token diperbarui');
    } catch (err) {
      if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
        return ApiResponse.unauthorized(res, 'Refresh token tidak valid atau kadaluarsa');
      }
      next(err);
    }
  }

  /**
   * GET /auth/me
   */
  async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      const sanitized = UserModel.sanitize(user);
      // Add permissions info
      sanitized.permissions = authManager.getPermissions(user.role);
      return ApiResponse.ok(res, sanitized);
    } catch (err) { next(err); }
  }

  /**
   * POST /auth/api-key — Generate or regenerate API key for current user.
   */
  async generateApiKey(req, res, next) {
    try {
      const apiKey = `wab_${randomUUID().replace(/-/g, '')}`;
      await UserModel.setApiKey(req.user.id, apiKey);

      await UserModel.auditLog({
        action: 'apikey.generated',
        userId: req.user.id,
        performedBy: req.user.id
      });

      return ApiResponse.ok(res, { apiKey }, 'API Key berhasil dibuat');
    } catch (err) { next(err); }
  }

  /**
   * DELETE /auth/api-key — Revoke API key.
   */
  async revokeApiKey(req, res, next) {
    try {
      await UserModel.setApiKey(req.user.id, null);

      await UserModel.auditLog({
        action: 'apikey.revoked',
        userId: req.user.id,
        performedBy: req.user.id
      });

      return ApiResponse.ok(res, null, 'API Key berhasil dicabut');
    } catch (err) { next(err); }
  }

  /**
   * POST /auth/change-password
   * body: { oldPassword, newPassword }
   */
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await UserModel.findById(req.user.id);

      if (!user) {
        return ApiResponse.notFound(res, 'User tidak ditemukan');
      }

      // Verify old password
      const valid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!valid) {
        return ApiResponse.unauthorized(res, 'Password lama salah');
      }

      // Validate new password against policy
      const policyCheck = authManager.validatePasswordPolicy(newPassword);
      if (!policyCheck.valid) {
        return ApiResponse.badRequest(res, 'Password tidak memenuhi kebijakan', { errors: policyCheck.errors });
      }

      // Check password history
      const reused = await authManager.isPasswordReused(req.user.id, newPassword);
      if (reused) {
        return ApiResponse.badRequest(res, 'Password sudah pernah digunakan sebelumnya');
      }

      // Save old hash to history, then update
      const newHash = await bcrypt.hash(newPassword, 12);
      await authManager.recordPasswordChange(req.user.id, user.passwordHash);
      await UserModel.update(req.user.id, { passwordHash: newHash });

      // Revoke all sessions except current
      await authManager.revokeAllSessions(req.user.id);

      return ApiResponse.ok(res, null, 'Password berhasil diubah. Semua sesi lain telah dicabut.');
    } catch (err) { next(err); }
  }

  /**
   * GET /auth/sessions — List active sessions for current user.
   */
  async listSessions(req, res, next) {
    try {
      const sessions = await authManager.getActiveSessions(req.user.id);
      return ApiResponse.ok(res, { sessions, total: sessions.length });
    } catch (err) { next(err); }
  }

  /**
   * DELETE /auth/sessions/:sessionId — Revoke a specific session.
   */
  async revokeSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const revoked = await authManager.revokeSession(req.user.id, sessionId);
      if (!revoked) {
        return ApiResponse.notFound(res, 'Session tidak ditemukan');
      }
      return ApiResponse.ok(res, null, 'Session berhasil dicabut');
    } catch (err) { next(err); }
  }

  /**
   * DELETE /auth/sessions — Revoke all sessions for current user.
   */
  async revokeAllSessions(req, res, next) {
    try {
      await authManager.revokeAllSessions(req.user.id);
      if (req.tokenJti) {
        authManager.blacklistToken(req.tokenJti, 15 * 60 * 1000);
      }
      if (this.botManager?.eventBus) {
        this.botManager.eventBus.emitEvent('auth.logout_all', { userId: req.user.id });
      }
      return ApiResponse.ok(res, null, 'Semua session berhasil dicabut');
    } catch (err) { next(err); }
  }

  /**
   * GET /auth/login-history — Get login history for current user.
   */
  async loginHistory(req, res, next) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const result = await authManager.getLoginHistory(req.user.id, {
        page: Number(page),
        limit: Number(limit)
      });
      return ApiResponse.ok(res, result);
    } catch (err) { next(err); }
  }

  /**
   * GET /auth/permissions — Get permissions for current user role.
   */
  async permissions(req, res, next) {
    try {
      const role = req.user.role;
      const permissions = authManager.getPermissions(role);
      return ApiResponse.ok(res, { role, permissions });
    } catch (err) { next(err); }
  }

  /**
   * GET /auth/system-info — Get auth system info (roles, permissions matrix, policies).
   */
  async systemInfo(req, res, next) {
    try {
      return ApiResponse.ok(res, authManager.getSystemInfo());
    } catch (err) { next(err); }
  }
}
