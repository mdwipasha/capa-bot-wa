import { Router } from 'express';
import { QueueController } from '../controllers/QueueController.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { queueJobIdValidator } from '../validators/queueValidator.js';

export default function queueRoutes(botManager) {
  const router = Router();
  const ctrl = new QueueController(botManager);

  router.use(authenticate);

  router.get('/', (req, res, next) => ctrl.list(req, res, next));
  router.get('/stats', (req, res, next) => ctrl.stats(req, res, next));
  router.get('/:id', queueJobIdValidator, validate, (req, res, next) => ctrl.getById(req, res, next));
  router.delete('/:id', authorize('admin'), queueJobIdValidator, validate, (req, res, next) => ctrl.cancel(req, res, next));
  router.post('/:id/retry', authorize('moderator'), queueJobIdValidator, validate, (req, res, next) => ctrl.retry(req, res, next));

  return router;
}
