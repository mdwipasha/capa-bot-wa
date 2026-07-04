import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UserModel } from '../../../models/UserModel.js';
import { ApiResponse } from '../../response/ApiResponse.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../../middleware/auth.js';

/**
 * AuthController — handles authentication operations.
 * No business logic here — delegates to UserModel and JWT helpers.
 */
export class AuthController {
  /**
   * POST /auth/login
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      const user = await UserModel.findByUsername(username);
      if (!user || !user.isActive) {
        return ApiResponse.unauthorized(res, 'Username atau password salah');
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return ApiResponse.unauthorized(res, 'Username atau password salah');
      }

      const accessToken = generateAccessToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      await UserModel.addRefreshToken(user.id, refreshToken);
      await UserModel.updateLastLogin(user.id);

      return ApiResponse.ok(res, {
        user: UserModel.sanitize(user),
        accessToken,
        refreshToken,
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
      return ApiResponse.ok(res, UserModel.sanitize(user));
    } catch (err) { next(err); }
  }

  /**
   * POST /auth/api-key — Generate or regenerate API key for current user.
   */
  async generateApiKey(req, res, next) {
    try {
      const apiKey = `wab_${randomUUID().replace(/-/g, '')}`;
      await UserModel.setApiKey(req.user.id, apiKey);
      return ApiResponse.ok(res, { apiKey }, 'API Key berhasil dibuat');
    } catch (err) { next(err); }
  }

  /**
   * DELETE /auth/api-key — Revoke API key.
   */
  async revokeApiKey(req, res, next) {
    try {
      await UserModel.setApiKey(req.user.id, null);
      return ApiResponse.ok(res, null, 'API Key berhasil dicabut');
    } catch (err) { next(err); }
  }
}
