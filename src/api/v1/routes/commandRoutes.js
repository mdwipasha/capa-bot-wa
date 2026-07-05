import { Router } from 'express';
import { CommandController } from '../controllers/CommandController.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { commandIdValidator } from '../validators/commandValidator.js';

export default function commandRoutes(botManager) {
  const router = Router();
  const ctrl = new CommandController(botManager);

  router.use(authenticate);

  // GET /commands — requires command.view permission
  router.get('/', requirePermission('command.view'), (req, res, next) => ctrl.list(req, res, next));

  // GET /commands/statistics — requires command.view permission
  router.get('/statistics', requirePermission('command.view'), (req, res, next) => ctrl.statistics(req, res, next));

  // GET /commands/:id — requires command.view permission
  router.get('/:id', requirePermission('command.view'), commandIdValidator, validate, (req, res, next) => ctrl.getById(req, res, next));

  // PATCH /commands/:id/enable — requires command.manage permission
  router.patch('/:id/enable', requirePermission('command.manage'), commandIdValidator, validate, (req, res, next) => ctrl.enable(req, res, next));

  // PATCH /commands/:id/disable — requires command.manage permission
  router.patch('/:id/disable', requirePermission('command.manage'), commandIdValidator, validate, (req, res, next) => ctrl.disable(req, res, next));

  // POST /commands/:id/reload — requires command.manage permission
  router.post('/:id/reload', requirePermission('command.manage'), commandIdValidator, validate, (req, res, next) => ctrl.reload(req, res, next));

  return router;
}
