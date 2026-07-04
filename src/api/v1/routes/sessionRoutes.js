import { Router } from 'express';
import { SessionController } from '../controllers/SessionController.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createSessionValidator, sessionIdValidator } from '../validators/sessionValidator.js';

export default function sessionRoutes(botManager) {
  const router = Router();
  const ctrl = new SessionController(botManager);

  router.use(authenticate);

  router.get('/', (req, res, next) => ctrl.list(req, res, next));
  router.post('/', authorize('admin'), createSessionValidator, validate, (req, res, next) => ctrl.create(req, res, next));
  router.delete('/:id', authorize('admin'), sessionIdValidator, validate, (req, res, next) => ctrl.remove(req, res, next));
  router.post('/:id/reconnect', authorize('moderator'), sessionIdValidator, validate, (req, res, next) => ctrl.reconnect(req, res, next));
  router.post('/:id/disconnect', authorize('moderator'), sessionIdValidator, validate, (req, res, next) => ctrl.disconnect(req, res, next));

  return router;
}
