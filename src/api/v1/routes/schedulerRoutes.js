import { Router } from 'express';
import { SchedulerController } from '../controllers/SchedulerController.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createJobValidator, updateJobValidator, jobIdValidator } from '../validators/schedulerValidator.js';

export default function schedulerRoutes(botManager) {
  const router = Router();
  const ctrl = new SchedulerController(botManager);

  router.use(authenticate);

  // GET /jobs — requires scheduler.view permission
  router.get('/', requirePermission('scheduler.view'), (req, res, next) => ctrl.list(req, res, next));

  // POST /jobs — requires scheduler.manage permission
  router.post('/', requirePermission('scheduler.manage'), createJobValidator, validate, (req, res, next) => ctrl.create(req, res, next));

  // GET /jobs/:id — requires scheduler.view permission
  router.get('/:id', requirePermission('scheduler.view'), jobIdValidator, validate, (req, res, next) => ctrl.getById(req, res, next));

  // PATCH /jobs/:id — requires scheduler.manage permission
  router.patch('/:id', requirePermission('scheduler.manage'), updateJobValidator, validate, (req, res, next) => ctrl.update(req, res, next));

  // DELETE /jobs/:id — requires scheduler.manage permission
  router.delete('/:id', requirePermission('scheduler.manage'), jobIdValidator, validate, (req, res, next) => ctrl.remove(req, res, next));

  // POST /jobs/:id/run — requires scheduler.manage permission
  router.post('/:id/run', requirePermission('scheduler.manage'), jobIdValidator, validate, (req, res, next) => ctrl.run(req, res, next));

  return router;
}
