import { Router } from 'express';
import { SessionController } from '../controllers/SessionController.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createSessionValidator, sessionIdValidator } from '../validators/sessionValidator.js';

export default function sessionRoutes(botManager) {
  const router = Router();
  const ctrl = new SessionController(botManager);

  router.use(authenticate);

  // GET /sessions — requires session.view permission
  router.get('/', requirePermission('session.view'), (req, res, next) => ctrl.list(req, res, next));

  // POST /sessions — requires session.manage permission
  router.post('/', requirePermission('session.manage'), createSessionValidator, validate, (req, res, next) => ctrl.create(req, res, next));

  router.post('/:id/pairing-code', requirePermission('session.manage'), sessionIdValidator, validate, (req, res, next) => ctrl.requestPairingCode(req, res, next));

  // DELETE /sessions/:id — requires session.manage permission
  router.delete('/:id', requirePermission('session.manage'), sessionIdValidator, validate, (req, res, next) => ctrl.remove(req, res, next));

  // POST /sessions/:id/reconnect — requires session.manage permission
  router.post('/:id/reconnect', requirePermission('session.manage'), sessionIdValidator, validate, (req, res, next) => ctrl.reconnect(req, res, next));

  // POST /sessions/:id/disconnect — requires session.manage permission
  router.post('/:id/disconnect', requirePermission('session.manage'), sessionIdValidator, validate, (req, res, next) => ctrl.disconnect(req, res, next));

  return router;
}
