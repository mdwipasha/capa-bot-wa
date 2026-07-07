import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { config } from '../../config/env.js';
import { UserModel } from '../../models/UserModel.js';
import { authManager } from '../../manager/AuthManager.js';
import { ApiResponse } from '../response/ApiResponse.js';

/**
 * Authentication middleware.
 * Supports: JWT Bearer Token, API Key (X-API-Key header), Session Token (X-Session-Token).
 * Checks: account lockout, token blacklist.
 */
export async function authenticate(req, res, next) {
  try {
    // 1. Try JWT Bearer Token
    const authHeader = req.headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, config.jwtSecret);

      // Check if token JTI is blacklisted
      if (decoded.jti && authManager.isTokenBlacklisted(decoded.jti)) {
        return ApiResponse.unauthorized(res, 'Token telah dicabut');
      }

      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.isActive) {
        return ApiResponse.unauthorized(res, 'Token tidak valid atau akun dinonaktifkan');
      }

      // Check account lockout
      const lockStatus = await authManager.isAccountLocked(decoded.userId);
      if (lockStatus.locked) {
        return ApiResponse.forbidden(res, `Akun terkunci: ${lockStatus.reason}`);
      }

      req.user = user;
      req.authMethod = 'jwt';
      req.tokenJti = decoded.jti || null;
      return next();
    }

    // 2. Try API Key
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    if (apiKey) {
      const user = await UserModel.findByApiKey(apiKey);
      if (!user || !user.isActive) {
        return ApiResponse.unauthorized(res, 'API Key tidak valid');
      }

      // Check account lockout
      const lockStatus = await authManager.isAccountLocked(user.id);
      if (lockStatus.locked) {
        return ApiResponse.forbidden(res, `Akun terkunci: ${lockStatus.reason}`);
      }

      req.user = user;
      req.authMethod = 'api_key';
      return next();
    }

    // 3. Try Session Token
    const sessionToken = req.headers['x-session-token'];
    if (sessionToken) {
      const decoded = jwt.verify(sessionToken, config.jwtSecret);

      // Check if token JTI is blacklisted
      if (decoded.jti && authManager.isTokenBlacklisted(decoded.jti)) {
        return ApiResponse.unauthorized(res, 'Session token telah dicabut');
      }

      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.isActive) {
        return ApiResponse.unauthorized(res, 'Session token tidak valid');
      }

      // Check account lockout
      const lockStatus = await authManager.isAccountLocked(decoded.userId);
      if (lockStatus.locked) {
        return ApiResponse.forbidden(res, `Akun terkunci: ${lockStatus.reason}`);
      }

      req.user = user;
      req.authMethod = 'session';
      req.tokenJti = decoded.jti || null;
      return next();
    }

    return ApiResponse.unauthorized(res, 'Autentikasi diperlukan');
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token telah kadaluarsa');
    }
    if (err.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Token tidak valid');
    }
    return next(err);
  }
}

/**
 * Optional auth — attach user to req if token present, but don't block.
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, config.jwtSecret);

      // Skip blacklisted tokens
      if (decoded.jti && authManager.isTokenBlacklisted(decoded.jti)) {
        return next();
      }

      const user = await UserModel.findById(decoded.userId);
      if (user?.isActive) {
        req.user = user;
        req.authMethod = 'jwt';
        req.tokenJti = decoded.jti || null;
      }
    }
  } catch {
    // Ignore errors — optional auth
  }
  next();
}

/**
 * Generate JWT access token with JTI for blacklist support.
 */
export function generateAccessToken(userId, role, jti = randomUUID()) {
  return jwt.sign(
    { userId, role, jti },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn || '15m' }
  );
}

/**
 * Generate JWT refresh token with JTI.
 */
export function generateRefreshToken(userId) {
  const jti = randomUUID();
  return jwt.sign(
    { userId, type: 'refresh', jti },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn || '7d' }
  );
}

/**
 * Verify refresh token.
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtRefreshSecret);
}
