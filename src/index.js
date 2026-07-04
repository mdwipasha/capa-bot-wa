import process from 'process';
import { CommandLoader } from './lib/commandLoader.js';
import { startDashboard } from './lib/dashboard.js';
import { startScheduler } from './lib/scheduler.js';
import { db } from './database/index.js';
import { config } from './config/env.js';
import { SessionManager } from './session/services/SessionManager.js';
import { SessionService } from './session/services/SessionService.js';
import { logger } from './utils/logger.js';

process.on('uncaughtException', (error) => logger.error('Uncaught exception', error.stack || error.message));
process.on('unhandledRejection', (error) => logger.error('Unhandled rejection', error?.stack || error));

const loader = new CommandLoader('src/commands');

const startBot = async () => {
  await db.init();
  await loader.load();
  loader.watch(() => logger.info('Commands hot reloaded'));

  const sessionManager = new SessionManager({ loader });
  const sessionService = new SessionService(sessionManager);
  await sessionService.restoreSessions();

  if (!sessionService.getAllSessions().length && config.ownerNumber) {
    await sessionService.createSession(config.ownerNumber);
  }

  startScheduler();
  startDashboard({ sessionService, restart: () => process.exit(0) });
};

startBot().catch((error) => logger.error('Startup error', error.stack || error.message));
