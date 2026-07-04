import process from 'process';
import { CommandLoader } from './lib/commandLoader.js';
import { createSocket, resetAuthSession } from './lib/baileys.js';
import { startDashboard } from './lib/dashboard.js';
import { startScheduler } from './lib/scheduler.js';
import { createCommandHandler } from './handlers/commandHandler.js';
import { handleConnectionUpdate } from './events/connection.js';
import { db } from './database/index.js';
import { logger } from './utils/logger.js';

process.on('uncaughtException', (error) => logger.error('Uncaught exception', error.stack || error.message));
process.on('unhandledRejection', (error) => logger.error('Unhandled rejection', error?.stack || error));

const botState = {
  isRunning: true,
  isConnected: false,
  qr: null,
  pairingCode: '',
  pairingStatus: 'Starting'
};

const loader = new CommandLoader('src/commands');
let sock;
let connectPromise;
let lifecycleVersion = 0;

const startBot = async () => {
  await db.init();
  await loader.load();
  loader.watch(() => logger.info('Commands hot reloaded'));

  const connect = async () => {
    if (!botState.isRunning) return;
    if (connectPromise) return connectPromise;

    connectPromise = (async () => {
      const version = lifecycleVersion;
      const currentSock = await createSocket(botState);
      if (!botState.isRunning || version !== lifecycleVersion) {
        currentSock.ev.removeAllListeners('creds.update');
        currentSock.end(new Error('Socket sudah tidak aktif'));
        return;
      }

      sock = currentSock;
      const onMessage = createCommandHandler({ loader, botState });

      currentSock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) await onMessage({ sock: currentSock, msg });
      });
      currentSock.ev.on('connection.update', async (update) => {
        if (sock !== currentSock) return;
        try {
          await handleConnectionUpdate({
            update,
            reconnect: connect,
            resetSession: async () => {
              currentSock.ev.removeAllListeners('creds.update');
              await resetAuthSession();
            },
            botState
          });
        } catch (error) {
          botState.pairingStatus = `Koneksi gagal: ${error.message}`;
          logger.error('Connection recovery error', error.stack || error.message);
        }
      });
    })();

    try {
      await connectPromise;
    } finally {
      connectPromise = null;
    }
  };

  const stop = async (status = 'Stopped dari dashboard') => {
    botState.isRunning = false;
    botState.isConnected = false;
    botState.qr = null;
    botState.pairingCode = '';
    botState.pairingStatus = status;
    lifecycleVersion += 1;

    const currentSock = sock;
    sock = null;
    if (currentSock) {
      currentSock.ev.removeAllListeners('creds.update');
      try {
        currentSock.end(new Error(status));
      } catch (error) {
        logger.debug(`Socket sudah tertutup: ${error.message}`);
      }
    }
    logger.warn(status);
  };

  const restart = async () => {
    await stop('Restarting dari dashboard...');
    botState.isRunning = true;
    botState.pairingStatus = 'Memulai ulang koneksi WhatsApp...';
    await connect();
    if (!sock && botState.isRunning) await connect();
    logger.info('Restart bot selesai diproses');
  };

  await connect();
  startScheduler();
  startDashboard({ botState, restart, stop });
};

startBot().catch((error) => logger.error('Startup error', error.stack || error.message));
