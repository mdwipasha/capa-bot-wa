import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../response/ApiResponse.js';
import { config } from '../../config/env.js';

const makeHandler = (message) => (req, res) => {
  ApiResponse.tooManyRequests(res, message);
};

/**
 * Global IP-based rate limiter — 200 requests per 15 minutes.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.apiRateLimitGlobal || 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: makeHandler('Terlalu banyak request. Coba lagi setelah 15 menit.')
});

/**
 * Auth endpoints limiter — 10 requests per 15 minutes (brute-force protection).
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.apiRateLimitAuth || 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: makeHandler('Terlalu banyak percobaan login. Coba lagi setelah 15 menit.')
});

/**
 * Message send limiter — 60 requests per minute.
 */
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.apiRateLimitMessage || 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: makeHandler('Terlalu banyak pesan. Coba lagi setelah 1 menit.')
});

/**
 * API Key limiter — 1000 requests per 15 minutes.
 */
export const apiKeyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.apiRateLimitApiKey || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
  handler: makeHandler('API Key rate limit tercapai. Coba lagi setelah 15 menit.')
});

/**
 * Dynamic rate limiter based on user role.
 * Owner/Admin get higher limits.
 */
export function userRoleLimiter(req, res, next) {
  const role = req.user?.role || 'viewer';
  const limits = {
    owner: 2000,
    admin: 1000,
    moderator: 500,
    developer: 500,
    viewer: 200
  };
  req._rateLimit = { max: limits[role] || 200 };
  next();
}
