import { reply } from '../lib/message.js';

export const sendLoading = async (sock, jid) => {
  await sock.sendPresenceUpdate('composing', jid).catch(() => {});
};

export const sendReply = (sock, msg, text, options = {}) => reply(sock, msg, text, options);

export const requireText = async (sock, msg, args, usage) => {
  const text = args.join(' ').trim();
  if (!text) {
    await sendReply(sock, msg, `Input kosong.\nContoh: ${usage}`);
    return null;
  }
  return text;
};

export const pickRandom = (items) => items[Math.floor(Math.random() * items.length)];

export const clean = (value = '', max = 3500) => String(value).trim().slice(0, max);
