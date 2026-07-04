import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { UserModel } from '../../models/UserModel.js';
import { ApiResponse } from '../response/ApiResponse.js';

/**
 * Authentication middleware.
 * Supports: JWT Bearer Token, API Key (X-API-Key header), Session Token (X-Session-Token).
 */
export async function authenticate(req, res, next) {
  try {
    // 1. Try JWT Bearer Token
    const authHeader = req.headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.isActive) {
        return ApiResponse.unauthorized(res, 'Token tidak valid atau akun dinonaktifkan');
      }
      req.user = user;
      req.authMethod = 'jwt';
      return next();
    }

    // 2. Try API Key
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    if (apiKey) {
      const user = await UserModel.findByApiKey(apiKey);
      if (!user || !user.isActive) {
        return ApiResponse.unauthorized(res, 'API Key tidak valid');
      }
      req.user = user;
      req.authMethod = 'api_key';
      return next();
    }

    // 3. Try Session Token
    const sessionToken = req.headers['x-session-token'];
    if (sessionToken) {
      const decoded = jwt.verify(sessionToken, config.jwtSecret);
      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.isActive) {
        return ApiResponse.unauthorized(res, 'Session token tidak valid');
      }
      req.user = user;
      req.authMethod = 'session';
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
      const user = await UserModel.findById(decoded.userId);
      if (user?.isActive) {
        req.user = user;
        req.authMethod = 'jwt';
      }
    }
  } catch {
    // Ignore errors — optional auth
  }
  next();
}

/**
 * Generate JWT access token.
 */
export function generateAccessToken(userId, role) {
  return jwt.sign(
    { userId, role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn || '15m' }
  );
}

/**
 * Generate JWT refresh token.
 */
export function generateRefreshToken(userId) {
  return jwt.sign(
    { userId, type: 'refresh' },
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
