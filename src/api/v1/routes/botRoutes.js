import { Router } from 'express';
import { BotController } from '../controllers/BotController.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createBotValidator, botIdValidator } from '../validators/botValidator.js';

/**
 * @param {import('../../../manager/BotManager.js').BotManager} botManager
 */
export default function botRoutes(botManager) {
  const router = Router();
  const ctrl = new BotController(botManager);

  router.use(authenticate);

  /**
   * @swagger
   * tags:
   *   name: Bots
   *   description: Bot management
   */

  // GET /bots
  router.get('/', (req, res, next) => ctrl.list(req, res, next));

  // GET /bots/:id
  router.get('/:id', botIdValidator, validate, (req, res, next) => ctrl.getById(req, res, next));

  // POST /bots — requires admin
  router.post('/', authorize('admin'), createBotValidator, validate, (req, res, next) => ctrl.create(req, res, next));

  // DELETE /bots/:id — requires admin
  router.delete('/:id', authorize('admin'), botIdValidator, validate, (req, res, next) => ctrl.remove(req, res, next));

  // POST /bots/:id/start — requires moderator
  router.post('/:id/start', authorize('moderator'), botIdValidator, validate, (req, res, next) => ctrl.start(req, res, next));

  // POST /bots/:id/stop — requires moderator
  router.post('/:id/stop', authorize('moderator'), botIdValidator, validate, (req, res, next) => ctrl.stop(req, res, next));

  // POST /bots/:id/restart — requires moderator
  router.post('/:id/restart', authorize('moderator'), botIdValidator, validate, (req, res, next) => ctrl.restart(req, res, next));

  // GET /bots/:id/stats
  router.get('/:id/stats', botIdValidator, validate, (req, res, next) => ctrl.stats(req, res, next));

  return router;
}
