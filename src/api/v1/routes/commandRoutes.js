import { Router } from 'express';
import { CommandController } from '../controllers/CommandController.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { commandIdValidator } from '../validators/commandValidator.js';

export default function commandRoutes(botManager) {
  const router = Router();
  const ctrl = new CommandController(botManager);

  router.use(authenticate);

  router.get('/', (req, res, next) => ctrl.list(req, res, next));
  router.get('/statistics', (req, res, next) => ctrl.statistics(req, res, next));
  router.get('/:id', commandIdValidator, validate, (req, res, next) => ctrl.getById(req, res, next));
  router.patch('/:id/enable', authorize('moderator'), commandIdValidator, validate, (req, res, next) => ctrl.enable(req, res, next));
  router.patch('/:id/disable', authorize('moderator'), commandIdValidator, validate, (req, res, next) => ctrl.disable(req, res, next));
  router.post('/:id/reload', authorize('admin'), commandIdValidator, validate, (req, res, next) => ctrl.reload(req, res, next));

  return router;
}
