export const normalizeJid = (jid = '') => jid.split(':')[0].replace('@s.whatsapp.net', '').replace('@g.us', '');

export const sanitizeText = (value = '', max = 4000) => String(value).replace(/\u0000/g, '').trim().slice(0, max);

export const pickText = (message = {}) => {
  const msg = message.message || {};
  return msg.conversation
    || msg.extendedTextMessage?.text
    || msg.imageMessage?.caption
    || msg.videoMessage?.caption
    || msg.documentMessage?.caption
    || '';
};

export const mentionedJids = (msg) => msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
