import bcrypt from 'bcryptjs';
import { UserModel } from '../../../models/UserModel.js';
import { ApiResponse } from '../../response/ApiResponse.js';
import { parsePagination, paginate, applySearch } from '../../response/paginate.js';
import { authManager } from '../../../manager/AuthManager.js';

/**
 * UserController — manages API users.
 * Requires proper authorization / permissions.
 */
export class UserController {
  /**
   * GET /users
   */
  async list(req, res, next) {
    try {
      const { page, limit, search } = parsePagination(req.query);
      let users = await UserModel.findAll();
      users = users.map(UserModel.sanitize);
      users = applySearch(users, search, ['username', 'email', 'role', 'displayName']);
      const result = paginate(users, { page, limit });
      return ApiResponse.ok(res, result);
    } catch (err) { next(err); }
  }

  /**
   * GET /users/:id
   */
  async getById(req, res, next) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) return ApiResponse.notFound(res, 'User tidak ditemukan');
      return ApiResponse.ok(res, UserModel.sanitize(user));
    } catch (err) { next(err); }
  }

  /**
   * POST /users
   * body: { username, password, role?, email?, displayName?, avatar? }
   */
  async create(req, res, next) {
    try {
      const { username, password, role, email, displayName, avatar } = req.body;

      const existing = await UserModel.findByUsername(username);
      if (existing) return ApiResponse.conflict(res, `Username "${username}" sudah digunakan`);

      // Password policy validation
      const policyCheck = authManager.validatePasswordPolicy(password);
      if (!policyCheck.valid) {
        return ApiResponse.badRequest(res, 'Password tidak memenuhi kebijakan', { errors: policyCheck.errors });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await UserModel.create({
        username,
        passwordHash,
        role,
        email,
        displayName: displayName || username,
        avatar: avatar || null
      });

      await UserModel.auditLog({
        action: 'user.created',
        userId: user.id,
        performedBy: req.user.id,
        details: { username, role }
      });

      return ApiResponse.created(res, UserModel.sanitize(user), 'User berhasil dibuat');
    } catch (err) { next(err); }
  }

  /**
   * PATCH /users/:id
   * body: { role?, email?, displayName?, avatar?, isActive?, password? }
   */
  async update(req, res, next) {
    try {
      const { role, email, displayName, avatar, isActive, password } = req.body;
      const targetId = req.params.id;

      const targetUser = await UserModel.findById(targetId);
      if (!targetUser) return ApiResponse.notFound(res, 'User tidak ditemukan');

      // Prevent non-owners from promoting/demoting to owner
      if (role === 'owner' && req.user.role !== 'owner') {
        return ApiResponse.forbidden(res, 'Hanya Owner yang dapat menunjuk Owner baru');
      }

      const fields = {};
      if (role !== undefined) fields.role = role;
      if (email !== undefined) fields.email = email;
      if (displayName !== undefined) fields.displayName = displayName;
      if (avatar !== undefined) fields.avatar = avatar;
      if (isActive !== undefined) fields.isActive = isActive;

      if (password) {
        // Password policy check
        const policyCheck = authManager.validatePasswordPolicy(password);
        if (!policyCheck.valid) {
          return ApiResponse.badRequest(res, 'Password tidak memenuhi kebijakan', { errors: policyCheck.errors });
        }

        // History check
        const reused = await authManager.isPasswordReused(targetId, password);
        if (reused) {
          return ApiResponse.badRequest(res, 'Password baru sudah pernah digunakan sebelumnya');
        }

        // Record history and generate hash
        await authManager.recordPasswordChange(targetId, targetUser.passwordHash);
        fields.passwordHash = await bcrypt.hash(password, 12);
      }

      const updated = await UserModel.update(targetId, fields);

      // Audit log
      await UserModel.auditLog({
        action: 'user.updated',
        userId: targetId,
        performedBy: req.user.id,
        details: Object.keys(fields).filter((k) => k !== 'passwordHash')
      });

      // If user became inactive or password changed, revoke their sessions
      if (isActive === false || password) {
        await authManager.revokeAllSessions(targetId);
      }

      return ApiResponse.ok(res, UserModel.sanitize(updated), 'User berhasil diperbarui');
    } catch (err) { next(err); }
  }

  /**
   * DELETE /users/:id
   */
  async remove(req, res, next) {
    try {
      const targetId = req.params.id;

      // Prevent deleting own account
      if (targetId === req.user?.id) {
        return ApiResponse.badRequest(res, 'Tidak dapat menghapus akun sendiri');
      }

      const targetUser = await UserModel.findById(targetId);
      if (!targetUser) return ApiResponse.notFound(res, 'User tidak ditemukan');

      // Prevent deleting owner
      if (targetUser.role === 'owner') {
        return ApiResponse.forbidden(res, 'Tidak dapat menghapus user dengan role Owner');
      }

      await authManager.revokeAllSessions(targetId);
      await UserModel.delete(targetId);

      await UserModel.auditLog({
        action: 'user.deleted',
        userId: targetId,
        performedBy: req.user.id,
        details: { username: targetUser.username }
      });

      return ApiResponse.ok(res, null, 'User berhasil dihapus');
    } catch (err) { next(err); }
  }

  /**
   * POST /users/:id/lock
   * body: { reason?, durationMinutes? }
   */
  async lockUser(req, res, next) {
    try {
      const targetId = req.params.id;
      const { reason, durationMinutes } = req.body;

      const targetUser = await UserModel.findById(targetId);
      if (!targetUser) return ApiResponse.notFound(res, 'User tidak ditemukan');

      if (targetUser.role === 'owner') {
        return ApiResponse.forbidden(res, 'Tidak dapat mengunci user dengan role Owner');
      }

      const durationMs = durationMinutes ? Number(durationMinutes) * 60 * 1000 : null;
      await authManager.lockAccount(targetId, reason || 'Locked by administrator', durationMs);
      await authManager.revokeAllSessions(targetId);

      await UserModel.auditLog({
        action: 'user.locked',
        userId: targetId,
        performedBy: req.user.id,
        details: { reason, durationMinutes }
      });

      return ApiResponse.ok(res, null, 'User berhasil dikunci');
    } catch (err) { next(err); }
  }

  /**
   * POST /users/:id/unlock
   */
  async unlockUser(req, res, next) {
    try {
      const targetId = req.params.id;
      const targetUser = await UserModel.findById(targetId);
      if (!targetUser) return ApiResponse.notFound(res, 'User tidak ditemukan');

      await authManager.unlockAccount(targetId, req.user.username);

      await UserModel.auditLog({
        action: 'user.unlocked',
        userId: targetId,
        performedBy: req.user.id
      });

      return ApiResponse.ok(res, null, 'User berhasil dibuka kuncinya');
    } catch (err) { next(err); }
  }

  /**
   * GET /users/:id/login-history
   */
  async userLoginHistory(req, res, next) {
    try {
      const targetId = req.params.id;
      const { page = 1, limit = 50 } = req.query;

      const targetUser = await UserModel.findById(targetId);
      if (!targetUser) return ApiResponse.notFound(res, 'User tidak ditemukan');

      const result = await authManager.getLoginHistory(targetId, {
        page: Number(page),
        limit: Number(limit)
      });
      return ApiResponse.ok(res, result);
    } catch (err) { next(err); }
  }

  /**
   * POST /users/:id/reset-password
   * body: { password }
   */
  async resetPassword(req, res, next) {
    try {
      const targetId = req.params.id;
      const { password } = req.body;

      const targetUser = await UserModel.findById(targetId);
      if (!targetUser) return ApiResponse.notFound(res, 'User tidak ditemukan');

      if (targetUser.role === 'owner' && req.user.role !== 'owner') {
        return ApiResponse.forbidden(res, 'Hanya Owner yang dapat mereset password Owner');
      }

      // Password policy validation
      const policyCheck = authManager.validatePasswordPolicy(password);
      if (!policyCheck.valid) {
        return ApiResponse.badRequest(res, 'Password tidak memenuhi kebijakan', { errors: policyCheck.errors });
      }

      // Record history and hash
      await authManager.recordPasswordChange(targetId, targetUser.passwordHash);
      const passwordHash = await bcrypt.hash(password, 12);
      await UserModel.update(targetId, { passwordHash });

      // Revoke all sessions force-logout
      await authManager.revokeAllSessions(targetId);

      await UserModel.auditLog({
        action: 'user.password_reset',
        userId: targetId,
        performedBy: req.user.id
      });

      return ApiResponse.ok(res, null, 'Password user berhasil di-reset. Semua sesi telah dicabut.');
    } catch (err) { next(err); }
  }

  /**
   * DELETE /users/:id/sessions
   */
  async revokeUserSessions(req, res, next) {
    try {
      const targetId = req.params.id;
      const targetUser = await UserModel.findById(targetId);
      if (!targetUser) return ApiResponse.notFound(res, 'User tidak ditemukan');

      await authManager.revokeAllSessions(targetId);

      await UserModel.auditLog({
        action: 'user.sessions_revoked',
        userId: targetId,
        performedBy: req.user.id
      });

      return ApiResponse.ok(res, null, 'Semua sesi user berhasil dicabut');
    } catch (err) { next(err); }
  }

  /**
   * GET /users/audit-logs
   */
  async auditLogs(req, res, next) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const result = await UserModel.getAuditLogs({ page: Number(page), limit: Number(limit) });
      return ApiResponse.ok(res, result);
    } catch (err) { next(err); }
  }
}
