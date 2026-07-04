import process from 'process';
import { CommandLoader } from './lib/commandLoader.js';
import { startDashboard } from './lib/dashboard.js';
import { startScheduler } from './lib/scheduler.js';
import { db } from './database/index.js';
import { BotManager } from './manager/BotManager.js';
import { logger } from './utils/logger.js';

process.on('uncaughtException', (error) => logger.error('Uncaught exception', error.stack || error.message));
process.on('unhandledRejection', (error) => logger.error('Unhandled rejection', error?.stack || error));

const loader = new CommandLoader('src/commands');

const startBot = async () => {
  await db.init();
  const botManager = new BotManager({ loader });
  await botManager.loadCommands();
  loader.watch(() => {
    botManager.messageRouter.clear();
    botManager.emit('plugin.reloaded', { total: loader.list().length });
    logger.info('Commands hot reloaded');
  });
  await botManager.restoreBots();

  startScheduler();
  startDashboard({ botManager, restart: () => process.exit(0) });
};

startBot().catch((error) => logger.error('Startup error', error.stack || error.message));
