import { DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { logger } from '../utils/logger.js';

export const handleConnectionUpdate = async ({
  update,
  reconnect,
  resetSession,
  botState
}) => {
  const { connection, lastDisconnect, qr } = update;
  if (qr) {
    botState.qr = qr;
    botState.pairingCode = '';
    botState.pairingStatus = 'QR tersedia. Scan dari WhatsApp > Perangkat tertaut.';
  }

  if (connection === 'open') {
    botState.isConnected = true;
    botState.qr = null;
    botState.pairingStatus = 'Connected';
    logger.success('WhatsApp connected');
  }

  if (connection === 'close') {
    botState.isConnected = false;
    botState.qr = null;
    botState.pairingCode = '';
    const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
    const loggedOut = statusCode === DisconnectReason.loggedOut;
    logger.warn(`Connection closed: ${statusCode || 'unknown'}`);

    if (loggedOut) {
      botState.pairingStatus = 'Logged out. Menyiapkan login baru...';
      await resetSession();
      logger.info('Session WhatsApp lama dibersihkan otomatis');
      botState.pairingStatus = 'Menunggu QR baru dari WhatsApp';
    } else {
      botState.pairingStatus = 'Reconnecting';
    }

    await reconnect();
  }
};
