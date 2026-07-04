import process from 'process';
import { PluginManager } from './plugin/PluginManager.js';
import { CommandLoader } from './lib/commandLoader.js';
import { startDashboard } from './lib/dashboard.js';
import { startScheduler } from './lib/scheduler.js';
import { db } from './database/index.js';
import { BotManager } from './manager/BotManager.js';
import { logger } from './utils/logger.js';

process.on('uncaughtException', (error) => logger.error('Uncaught exception', error.stack || error.message));
process.on('unhandledRejection', (error) => logger.error('Unhandled rejection', error?.stack || error));

const startBot = async () => {
  await db.init();

  // 1. Buat PluginManager — façade utama semua operasi plugin
  const pluginManager = new PluginManager({
    pluginsDir: 'src/commands',
    watchEnabled: true   // aktifkan hot-reload watcher
  });

  // 2. CommandLoader sebagai thin adapter atas PluginManager
  const loader = new CommandLoader('src/commands', pluginManager);

  // 3. BotManager menerima kedua-duanya untuk backward compat
  const botManager = new BotManager({ loader, pluginManager });

  // 4. Load semua plugin
  await botManager.loadCommands();

  // 5. Aktifkan watcher + register callback untuk clear router cache
  loader.watch(() => {
    botManager.messageRouter.clear();
    botManager.emit('plugin.reloaded', { total: loader.list().length });
    logger.info('Plugins hot reloaded');
  });

  // 6. Restore bot sessions
  await botManager.restoreBots();

  startScheduler();
  startDashboard({ botManager, restart: () => process.exit(0) });
};

startBot().catch((error) => logger.error('Startup error', error.stack || error.message));

