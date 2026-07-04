import { Router } from 'express';
import { SystemController } from '../controllers/SystemController.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';

export default function systemRoutes(botManager) {
  const router = Router();
  const ctrl = new SystemController(botManager);

  // Health check — public endpoint, no auth required
  router.get('/health', (req, res, next) => ctrl.health(req, res, next));

  // Protected routes
  router.use(authenticate);

  router.get('/', (req, res, next) => ctrl.overview(req, res, next));
  router.get('/statistics', (req, res, next) => ctrl.statistics(req, res, next));
  router.get('/logs', authorize('admin'), (req, res, next) => ctrl.logs(req, res, next));

  return router;
}
