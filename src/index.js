import process from 'process';
import { CommandLoader } from './lib/commandLoader.js';
import { createSocket } from './lib/baileys.js';
import { startDashboard } from './lib/dashboard.js';
import { startScheduler } from './lib/scheduler.js';
import { createCommandHandler } from './handlers/commandHandler.js';
import { handleConnectionUpdate } from './events/connection.js';
import { handleGroupParticipantsUpdate } from './events/groupParticipants.js';
import { db } from './database/index.js';
import { logger } from './utils/logger.js';

process.on('uncaughtException', (error) => logger.error('Uncaught exception', error.stack || error.message));
process.on('unhandledRejection', (error) => logger.error('Unhandled rejection', error?.stack || error));

const botState = {
  isConnected: false,
  qr: null,
  pairingCode: '',
  pairingStatus: 'Starting'
};

const loader = new CommandLoader('src/commands');
let sock;

const startBot = async () => {
  await db.init();
  await loader.load();
  loader.watch(() => logger.info('Commands hot reloaded'));

  const connect = async () => {
    sock = await createSocket(botState);
    const onMessage = createCommandHandler({ loader, botState });
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) await onMessage({ sock, msg });
    });
    sock.ev.on('group-participants.update', async (update) => handleGroupParticipantsUpdate({ sock, update }));
    sock.ev.on('connection.update', (update) => handleConnectionUpdate({ update, reconnect: connect, botState }));
  };

  await connect();
  startScheduler();
  startDashboard({ botState, restart: () => process.exit(0) });
};

startBot().catch((error) => logger.error('Startup error', error.stack || error.message));
