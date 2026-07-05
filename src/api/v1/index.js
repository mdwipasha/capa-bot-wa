import { Router } from 'express';
import authRoutes from './routes/authRoutes.js';
import botRoutes from './routes/botRoutes.js';
import pluginRoutes from './routes/pluginRoutes.js';
import commandRoutes from './routes/commandRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import schedulerRoutes from './routes/schedulerRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import userRoutes from './routes/userRoutes.js';
import configRoutes from './routes/configRoutes.js';

/**
 * Build and return v1 router with all sub-routes mounted.
 * @param {import('../../manager/BotManager.js').BotManager} botManager
 */
export function buildV1Router(botManager) {
  const router = Router();

  router.use('/auth', authRoutes);
  router.use('/bots', botRoutes(botManager));
  router.use('/plugins', pluginRoutes(botManager));
  router.use('/commands', commandRoutes(botManager));
  router.use('/sessions', sessionRoutes(botManager));
  router.use('/messages', messageRoutes(botManager));
  router.use('/queue', queueRoutes(botManager));
  router.use('/jobs', schedulerRoutes(botManager));
  router.use('/system', systemRoutes(botManager));
  router.use('/users', userRoutes());
  router.use('/config', configRoutes());

  return router;
}
