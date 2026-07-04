import process from 'process';
import { PluginManager } from './plugin/PluginManager.js';
import { CommandLoader } from './lib/commandLoader.js';
import { CommandManager } from './command/CommandManager.js';
import { startDashboard } from './lib/dashboard.js';
import { startScheduler } from './lib/scheduler.js';
import { db } from './database/index.js';
import { BotManager } from './manager/BotManager.js';
import { logger } from './utils/logger.js';
import { config } from './config/env.js';
import { serviceManager } from './services/ServiceManager.js';

process.on('uncaughtException', (error) => logger.error('Uncaught exception', error.stack || error.message));
process.on('unhandledRejection', (error) => logger.error('Unhandled rejection', error?.stack || error));

const startBot = async () => {
  await db.init();
  serviceManager.init(config);

  // 1. Buat PluginManager — tetap ada untuk backward compat
  const pluginManager = new PluginManager({
    pluginsDir: 'src/commands',
    watchEnabled: false  // watcher dikelola oleh CommandManager
  });

  // 2. CommandLoader sebagai thin adapter atas PluginManager (backward compat)
  const loader = new CommandLoader('src/commands', pluginManager);

  // 3. CommandManager — pusat pengelolaan command
  const commandManager = new CommandManager({
    commandsDir: 'src/commands',
    prefixes: config.prefixes,
    ownerNumber: config.ownerNumber,
    botName: config.botName,
    defaultCooldown: Math.round((config.cooldownMs || 3000) / 1000),
    watchEnabled: true   // aktifkan hot-reload watcher
  });

  // 4. BotManager menerima semua dependency
  const botManager = new BotManager({ loader, pluginManager, commandManager });

  // 5. Load semua command melalui CommandManager
  await botManager.loadCommands();

  // 6. Register hot-reload callback ke CommandManager
  commandManager.onReload(() => {
    botManager.messageRouter.clear();
    botManager.emit('command.reloaded', { total: commandManager.count() });
    logger.info(`Commands hot reloaded — ${commandManager.count()} command aktif`);
  });

  // 7. Restore bot sessions
  await botManager.restoreBots();

  // 8. Inisialisasi SchedulerManager dan start scheduler
  await botManager.schedulerManager.init();
  await startScheduler(botManager.schedulerManager);

  startDashboard({ botManager, restart: () => process.exit(0) });
};

startBot().catch((error) => logger.error('Startup error', error.stack || error.message));

