import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import {
  loginValidator,
  refreshValidator,
  changePasswordValidator
} from '../validators/authValidator.js';

const router = Router();
const ctrl = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

router.post('/login', authLimiter, loginValidator, validate, (req, res, next) => ctrl.login(req, res, next));
router.post('/logout', authenticate, (req, res, next) => ctrl.logout(req, res, next));
router.post('/refresh', authLimiter, refreshValidator, validate, (req, res, next) => ctrl.refresh(req, res, next));
router.get('/me', authenticate, (req, res, next) => ctrl.me(req, res, next));
router.post('/api-key', authenticate, (req, res, next) => ctrl.generateApiKey(req, res, next));
router.delete('/api-key', authenticate, (req, res, next) => ctrl.revokeApiKey(req, res, next));

// ─── New Authentication / Session endpoints ───
router.post('/change-password', authenticate, changePasswordValidator, validate, (req, res, next) => ctrl.changePassword(req, res, next));
router.get('/sessions', authenticate, (req, res, next) => ctrl.listSessions(req, res, next));
router.delete('/sessions/:sessionId', authenticate, (req, res, next) => ctrl.revokeSession(req, res, next));
router.delete('/sessions', authenticate, (req, res, next) => ctrl.revokeAllSessions(req, res, next));
router.get('/login-history', authenticate, (req, res, next) => ctrl.loginHistory(req, res, next));
router.get('/permissions', authenticate, (req, res, next) => ctrl.permissions(req, res, next));
router.get('/system-info', authenticate, (req, res, next) => ctrl.systemInfo(req, res, next));

export default router;
