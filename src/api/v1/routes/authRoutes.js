import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import {
  loginValidator,
  refreshValidator
} from '../validators/authValidator.js';

const router = Router();
const ctrl = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login dan dapatkan JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post('/login', authLimiter, loginValidator, validate, (req, res, next) => ctrl.login(req, res, next));

router.post('/logout', authenticate, (req, res, next) => ctrl.logout(req, res, next));
router.post('/refresh', authLimiter, refreshValidator, validate, (req, res, next) => ctrl.refresh(req, res, next));
router.get('/me', authenticate, (req, res, next) => ctrl.me(req, res, next));
router.post('/api-key', authenticate, (req, res, next) => ctrl.generateApiKey(req, res, next));
router.delete('/api-key', authenticate, (req, res, next) => ctrl.revokeApiKey(req, res, next));

export default router;
