import { Router } from 'express';
import { SystemController } from '../controllers/SystemController.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';

export default function systemRoutes(botManager) {
  const router = Router();
  const ctrl = new SystemController(botManager);

  // Health check — public endpoint, no auth required
  router.get('/health', (req, res, next) => ctrl.health(req, res, next));

  // Protected routes
  router.use(authenticate);

  // GET /system — requires system.view permission
  router.get('/', requirePermission('system.view'), (req, res, next) => ctrl.overview(req, res, next));

  // GET /system/statistics — requires system.view permission
  router.get('/statistics', requirePermission('system.view'), (req, res, next) => ctrl.statistics(req, res, next));

  // GET /system/logs — requires audit.view permission
  router.get('/logs', requirePermission('audit.view'), (req, res, next) => ctrl.logs(req, res, next));

  return router;
}
