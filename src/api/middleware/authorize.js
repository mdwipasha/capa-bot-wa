import { ApiResponse } from '../response/ApiResponse.js';

/**
 * Role hierarchy — higher index = more permissions.
 */
const ROLE_HIERARCHY = {
  viewer: 0,
  developer: 1,
  moderator: 2,
  admin: 3,
  owner: 4
};

/**
 * RBAC middleware factory.
 * Usage: authorize('admin') — allows admin and owner.
 *        authorize(['admin','developer']) — allows any of those roles.
 *
 * @param {string|string[]} requiredRole — minimum role or list of allowed roles
 */
export function authorize(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Autentikasi diperlukan');
    }

    const userRole = req.user.role || 'viewer';
    const userLevel = ROLE_HIERARCHY[userRole] ?? -1;

    if (Array.isArray(requiredRole)) {
      // Any of the listed roles is accepted
      const allowed = requiredRole.some((r) => {
        const requiredLevel = ROLE_HIERARCHY[r] ?? 99;
        return userLevel >= requiredLevel;
      });
      if (allowed) return next();
    } else {
      const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 99;
      if (userLevel >= requiredLevel) return next();
    }

    return ApiResponse.forbidden(
      res,
      `Akses ditolak. Role "${userRole}" tidak memiliki izin untuk operasi ini.`
    );
  };
}

/**
 * Convenience: allow only owner.
 */
export const ownerOnly = authorize('owner');

/**
 * Convenience: allow admin and above.
 */
export const adminOnly = authorize('admin');

/**
 * Convenience: allow moderator and above.
 */
export const moderatorOnly = authorize('moderator');

/**
 * Convenience: any authenticated user.
 */
export const anyRole = (req, res, next) => {
  if (!req.user) return ApiResponse.unauthorized(res);
  next();
};
