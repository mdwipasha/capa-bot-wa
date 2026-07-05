import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  createUserValidator,
  updateUserValidator,
  userIdValidator,
  lockUserValidator,
  resetPasswordValidator
} from '../validators/userValidator.js';

export default function userRoutes() {
  const router = Router();
  const ctrl = new UserController();

  router.use(authenticate);

  // GET /users — requires user.view permission
  router.get('/', requirePermission('user.view'), (req, res, next) => ctrl.list(req, res, next));
  
  // GET /users/audit-logs — requires audit.view permission
  router.get('/audit-logs', requirePermission('audit.view'), (req, res, next) => ctrl.auditLogs(req, res, next));
  
  // GET /users/:id — requires user.view permission
  router.get('/:id', requirePermission('user.view'), userIdValidator, validate, (req, res, next) => ctrl.getById(req, res, next));
  
  // POST /users — requires user.manage permission
  router.post('/', requirePermission('user.manage'), createUserValidator, validate, (req, res, next) => ctrl.create(req, res, next));
  
  // PATCH /users/:id — requires user.manage permission
  router.patch('/:id', requirePermission('user.manage'), updateUserValidator, validate, (req, res, next) => ctrl.update(req, res, next));
  
  // DELETE /users/:id — requires user.delete permission (Owner only by policy map)
  router.delete('/:id', requirePermission('user.delete'), userIdValidator, validate, (req, res, next) => ctrl.remove(req, res, next));

  // ─── Lock / Unlock endpoints ───
  router.post('/:id/lock', requirePermission('user.manage'), lockUserValidator, validate, (req, res, next) => ctrl.lockUser(req, res, next));
  router.post('/:id/unlock', requirePermission('user.manage'), userIdValidator, validate, (req, res, next) => ctrl.unlockUser(req, res, next));

  // ─── Login history endpoint ───
  router.get('/:id/login-history', requirePermission('user.view'), userIdValidator, validate, (req, res, next) => ctrl.userLoginHistory(req, res, next));

  // ─── Force Reset Password endpoint ───
  router.post('/:id/reset-password', requirePermission('user.manage'), resetPasswordValidator, validate, (req, res, next) => ctrl.resetPassword(req, res, next));

  // ─── Revoke Sessions endpoint ───
  router.delete('/:id/sessions', requirePermission('user.manage'), userIdValidator, validate, (req, res, next) => ctrl.revokeUserSessions(req, res, next));

  return router;
}
