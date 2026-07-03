import { DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { logger } from '../utils/logger.js';

export const handleConnectionUpdate = ({ update, reconnect, botState }) => {
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
    const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
    const loggedOut = statusCode === DisconnectReason.loggedOut;
    botState.pairingStatus = loggedOut ? 'Logged out' : 'Reconnecting';
    logger.warn(`Connection closed: ${statusCode || 'unknown'}`);
    if (!loggedOut) reconnect();
  }
};
