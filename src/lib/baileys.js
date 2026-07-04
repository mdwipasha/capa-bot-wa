import makeWASocket, {
  Browsers,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import fs from 'fs-extra';
import { config } from '../config/env.js';
import { rawLogger, logger } from '../utils/logger.js';

export const createSocket = async (botState, options = {}) => {
  const sessionPath = options.sessionPath || config.sessionPath;
  const pairingPhoneNumber = options.pairingPhoneNumber || config.ownerNumber;

  await fs.ensureDir(sessionPath);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: rawLogger,
    printQRInTerminal: false,
    browser: Browsers.macOS(config.botName),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, rawLogger)
    },
    qrTimeout: 60000,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.sessionPath = sessionPath;

  if (!sock.authState.creds.registered && config.authMethod === 'pairing' && pairingPhoneNumber) {
    setTimeout(async () => {
      try {
        const phoneNumber = pairingPhoneNumber.replace(/\D/g, '');
        const code = await sock.requestPairingCode(phoneNumber);
        botState.pairingCode = code;
        botState.pairingStatus = `Pairing code aktif: ${code}`;
        logger.success(`Pairing code untuk ${phoneNumber}: ${code}`);
      } catch (error) {
        botState.pairingStatus = `Pairing gagal: ${error.message}`;
        logger.warn(`Pairing code gagal dibuat: ${error.message}`);
      }
    }, 1500);
  } else if (!sock.authState.creds.registered && config.authMethod === 'qr') {
    botState.pairingStatus = 'Menunggu QR dari WhatsApp';
  }

  return sock;
};
