import { Router } from 'express';
import { PluginController } from '../controllers/PluginController.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { pluginIdValidator, installPluginValidator } from '../validators/pluginValidator.js';

export default function pluginRoutes(botManager) {
  const router = Router();
  const ctrl = new PluginController(botManager);

  router.use(authenticate);

  router.get('/', (req, res, next) => ctrl.list(req, res, next));
  router.get('/:id', pluginIdValidator, validate, (req, res, next) => ctrl.getById(req, res, next));
  router.post('/', authorize('admin'), installPluginValidator, validate, (req, res, next) => ctrl.install(req, res, next));
  router.delete('/:id', authorize('admin'), pluginIdValidator, validate, (req, res, next) => ctrl.remove(req, res, next));
  router.patch('/:id/enable', authorize('moderator'), pluginIdValidator, validate, (req, res, next) => ctrl.enable(req, res, next));
  router.patch('/:id/disable', authorize('moderator'), pluginIdValidator, validate, (req, res, next) => ctrl.disable(req, res, next));
  router.post('/:id/reload', authorize('admin'), pluginIdValidator, validate, (req, res, next) => ctrl.reload(req, res, next));

  return router;
}
