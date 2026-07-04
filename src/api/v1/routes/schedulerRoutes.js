import { Router } from 'express';
import { SchedulerController } from '../controllers/SchedulerController.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createJobValidator, updateJobValidator, jobIdValidator } from '../validators/schedulerValidator.js';

export default function schedulerRoutes(botManager) {
  const router = Router();
  const ctrl = new SchedulerController(botManager);

  router.use(authenticate);

  router.get('/', (req, res, next) => ctrl.list(req, res, next));
  router.post('/', authorize('admin'), createJobValidator, validate, (req, res, next) => ctrl.create(req, res, next));
  router.get('/:id', jobIdValidator, validate, (req, res, next) => ctrl.getById(req, res, next));
  router.patch('/:id', authorize('admin'), updateJobValidator, validate, (req, res, next) => ctrl.update(req, res, next));
  router.delete('/:id', authorize('admin'), jobIdValidator, validate, (req, res, next) => ctrl.remove(req, res, next));
  router.post('/:id/run', authorize('moderator'), jobIdValidator, validate, (req, res, next) => ctrl.run(req, res, next));

  return router;
}
