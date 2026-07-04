import bcrypt from 'bcryptjs';
import { UserModel } from '../../../models/UserModel.js';
import { ApiResponse } from '../../response/ApiResponse.js';
import { parsePagination, paginate, applySearch } from '../../response/paginate.js';

/**
 * UserController — manages API users.
 * Only owner/admin can manage users.
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
      users = applySearch(users, search, ['username', 'email', 'role']);
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
   * body: { username, password, role?, email? }
   */
  async create(req, res, next) {
    try {
      const { username, password, role, email } = req.body;

      const existing = await UserModel.findByUsername(username);
      if (existing) return ApiResponse.conflict(res, `Username "${username}" sudah digunakan`);

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await UserModel.create({ username, passwordHash, role, email });
      return ApiResponse.created(res, UserModel.sanitize(user), 'User berhasil dibuat');
    } catch (err) { next(err); }
  }

  /**
   * PATCH /users/:id
   * body: { role?, email?, isActive?, password? }
   */
  async update(req, res, next) {
    try {
      const { role, email, isActive, password } = req.body;
      const fields = {};
      if (role !== undefined) fields.role = role;
      if (email !== undefined) fields.email = email;
      if (isActive !== undefined) fields.isActive = isActive;
      if (password) fields.passwordHash = await bcrypt.hash(password, 12);

      const user = await UserModel.update(req.params.id, fields);
      if (!user) return ApiResponse.notFound(res, 'User tidak ditemukan');
      return ApiResponse.ok(res, UserModel.sanitize(user), 'User berhasil diperbarui');
    } catch (err) { next(err); }
  }

  /**
   * DELETE /users/:id
   */
  async remove(req, res, next) {
    try {
      // Prevent deleting own account
      if (req.params.id === req.user?.id) {
        return ApiResponse.badRequest(res, 'Tidak dapat menghapus akun sendiri');
      }
      const deleted = await UserModel.delete(req.params.id);
      if (!deleted) return ApiResponse.notFound(res, 'User tidak ditemukan');
      return ApiResponse.ok(res, null, 'User berhasil dihapus');
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
