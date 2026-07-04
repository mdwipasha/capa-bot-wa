import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createUserValidator, updateUserValidator, userIdValidator } from '../validators/userValidator.js';

export default function userRoutes() {
  const router = Router();
  const ctrl = new UserController();

  router.use(authenticate);
  router.use(authorize('admin'));

  router.get('/', (req, res, next) => ctrl.list(req, res, next));
  router.get('/audit-logs', authorize('admin'), (req, res, next) => ctrl.auditLogs(req, res, next));
  router.get('/:id', userIdValidator, validate, (req, res, next) => ctrl.getById(req, res, next));
  router.post('/', createUserValidator, validate, (req, res, next) => ctrl.create(req, res, next));
  router.patch('/:id', updateUserValidator, validate, (req, res, next) => ctrl.update(req, res, next));
  router.delete('/:id', authorize('owner'), userIdValidator, validate, (req, res, next) => ctrl.remove(req, res, next));

  return router;
}
