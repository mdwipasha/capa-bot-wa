import { Router } from 'express';
import { BroadcastController } from '../controllers/BroadcastController.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { messageLimiter } from '../../middleware/rateLimiter.js';
import { validate } from '../../middleware/validate.js';
import { sendMessageValidator, broadcastValidator, replyValidator } from '../validators/messageValidator.js';

export default function messageRoutes(botManager) {
  const router = Router();
  const ctrl = new BroadcastController(botManager);

  router.use(authenticate);
  router.use(messageLimiter);

  router.post('/send', authorize('moderator'), sendMessageValidator, validate, (req, res, next) => ctrl.send(req, res, next));
  router.post('/broadcast', authorize('admin'), broadcastValidator, validate, (req, res, next) => ctrl.broadcast(req, res, next));
  router.post('/reply', authorize('moderator'), replyValidator, validate, (req, res, next) => ctrl.reply(req, res, next));

  return router;
}
