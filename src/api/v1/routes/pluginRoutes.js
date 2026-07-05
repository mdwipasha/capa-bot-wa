import { Router } from 'express';
import { PluginController } from '../controllers/PluginController.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { pluginIdValidator, installPluginValidator } from '../validators/pluginValidator.js';

export default function pluginRoutes(botManager) {
  const router = Router();
  const ctrl = new PluginController(botManager);

  router.use(authenticate);

  // GET /plugins — requires plugin.view permission
  router.get('/', requirePermission('plugin.view'), (req, res, next) => ctrl.list(req, res, next));

  // GET /plugins/:id — requires plugin.view permission
  router.get('/:id', requirePermission('plugin.view'), pluginIdValidator, validate, (req, res, next) => ctrl.getById(req, res, next));

  // POST /plugins — requires plugin.manage permission
  router.post('/', requirePermission('plugin.manage'), installPluginValidator, validate, (req, res, next) => ctrl.install(req, res, next));

  // DELETE /plugins/:id — requires plugin.manage permission
  router.delete('/:id', requirePermission('plugin.manage'), pluginIdValidator, validate, (req, res, next) => ctrl.remove(req, res, next));

  // PATCH /plugins/:id/enable — requires plugin.manage permission
  router.patch('/:id/enable', requirePermission('plugin.manage'), pluginIdValidator, validate, (req, res, next) => ctrl.enable(req, res, next));

  // PATCH /plugins/:id/disable — requires plugin.manage permission
  router.patch('/:id/disable', requirePermission('plugin.manage'), pluginIdValidator, validate, (req, res, next) => ctrl.disable(req, res, next));

  // POST /plugins/:id/reload — requires plugin.manage permission
  router.post('/:id/reload', requirePermission('plugin.manage'), pluginIdValidator, validate, (req, res, next) => ctrl.reload(req, res, next));

  return router;
}
