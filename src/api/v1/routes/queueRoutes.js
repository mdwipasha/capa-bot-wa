import { Router } from 'express';
import { QueueController } from '../controllers/QueueController.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { queueJobIdValidator } from '../validators/queueValidator.js';

export default function queueRoutes(botManager) {
  const router = Router();
  const ctrl = new QueueController(botManager);

  router.use(authenticate);

  // GET /queue — requires queue.view permission
  router.get('/', requirePermission('queue.view'), (req, res, next) => ctrl.list(req, res, next));

  // GET /queue/stats — requires queue.view permission
  router.get('/stats', requirePermission('queue.view'), (req, res, next) => ctrl.stats(req, res, next));

  // GET /queue/:id — requires queue.view permission
  router.get('/:id', requirePermission('queue.view'), queueJobIdValidator, validate, (req, res, next) => ctrl.getById(req, res, next));

  // DELETE /queue/:id — requires queue.manage permission
  router.delete('/:id', requirePermission('queue.manage'), queueJobIdValidator, validate, (req, res, next) => ctrl.cancel(req, res, next));

  // POST /queue/:id/retry — requires queue.manage permission
  router.post('/:id/retry', requirePermission('queue.manage'), queueJobIdValidator, validate, (req, res, next) => ctrl.retry(req, res, next));

  return router;
}
