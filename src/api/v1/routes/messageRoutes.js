import { Router } from 'express';
import { BroadcastController } from '../controllers/BroadcastController.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
import { messageLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import { sendMessageValidator, broadcastValidator, replyValidator } from '../validators/messageValidator.js';

export default function messageRoutes(botManager) {
  const router = Router();
  const ctrl = new BroadcastController(botManager);

  router.use(authenticate);
  router.use(messageLimiter);

  // POST /messages/send — requires message.send permission
  router.post('/send', requirePermission('message.send'), sendMessageValidator, validate, (req, res, next) => ctrl.send(req, res, next));

  // POST /messages/broadcast — requires message.broadcast permission
  router.post('/broadcast', requirePermission('message.broadcast'), broadcastValidator, validate, (req, res, next) => ctrl.broadcast(req, res, next));

  // POST /messages/reply — requires message.send permission
  router.post('/reply', requirePermission('message.send'), replyValidator, validate, (req, res, next) => ctrl.reply(req, res, next));

  return router;
}
