import { downloadMedia } from './message.js';

export const getQuotedMessage = (msg) => {
  const context = msg.message?.extendedTextMessage?.contextInfo
    || msg.message?.imageMessage?.contextInfo
    || msg.message?.videoMessage?.contextInfo
    || msg.message?.audioMessage?.contextInfo
    || msg.message?.stickerMessage?.contextInfo
    || msg.message?.documentMessage?.contextInfo;
  if (!context?.quotedMessage) return null;
  return {
    key: {
      remoteJid: msg.key.remoteJid,
      id: context.stanzaId,
      participant: context.participant
    },
    message: context.quotedMessage
  };
};

export const downloadQuotedOrCurrent = async (msg) => {
  const quoted = getQuotedMessage(msg);
  return downloadMedia(quoted || msg);
};
