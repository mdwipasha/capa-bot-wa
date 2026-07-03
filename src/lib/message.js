import { downloadContentFromMessage, jidDecode } from '@whiskeysockets/baileys';
import { fileTypeFromBuffer } from 'file-type';
import { normalizeJid } from '../utils/text.js';

export const isGroupJid = (jid = '') => jid.endsWith('@g.us');

export const jidNumber = (jid = '') => {
  const decoded = jidDecode(jid);
  return normalizeJid(decoded?.user || jid);
};

export const jidVariants = (...values) => {
  const variants = new Set();
  for (const value of values.filter(Boolean)) {
    const decoded = jidDecode(value);
    variants.add(value);
    if (decoded?.user) variants.add(`${decoded.user}@s.whatsapp.net`);
    if (decoded?.user && value.endsWith('@lid')) variants.add(`${decoded.user}@lid`);
    const number = jidNumber(value);
    if (number) variants.add(number);
  }
  return variants;
};

export const senderJid = (msg) => {
  const jid = msg.key.participant || msg.key.remoteJid || '';
  const decoded = jidDecode(jid);
  return decoded?.user ? `${decoded.user}@s.whatsapp.net` : jid;
};

export const senderNumber = (msg) => jidNumber(msg.key.participant || msg.key.remoteJid || '');

export const senderVariants = (msg) => jidVariants(
  msg.key.participant,
  msg.key.participantPn,
  msg.key.remoteJid,
  senderJid(msg)
);

export const reply = (sock, msg, text, options = {}) => sock.sendMessage(
  msg.key.remoteJid,
  { text, ...options },
  { quoted: msg }
);

export const downloadMedia = async (message) => {
  const content = unwrapMessageContent(message.message || {});
  const type = Object.keys(content).find((key) => key.endsWith('Message'));
  if (!type) return null;
  const media = content[type];
  const stream = await downloadContentFromMessage(media, type.replace('Message', ''));
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);
  const fileType = await fileTypeFromBuffer(buffer).catch(() => null);
  return { buffer, type, mime: media.mimetype || fileType?.mime || '', ext: fileType?.ext || 'bin' };
};

export const unwrapMessageContent = (content = {}) => {
  let current = content;
  while (
    current.ephemeralMessage?.message
    || current.viewOnceMessage?.message
    || current.viewOnceMessageV2?.message
    || current.viewOnceMessageV2Extension?.message
    || current.documentWithCaptionMessage?.message
  ) {
    current = current.ephemeralMessage?.message
      || current.viewOnceMessage?.message
      || current.viewOnceMessageV2?.message
      || current.viewOnceMessageV2Extension?.message
      || current.documentWithCaptionMessage?.message;
  }
  return current;
};

export const groupAdmins = async (sock, jid) => {
  const metadata = await sock.groupMetadata(jid);
  return metadata.participants.filter((p) => p.admin || p.isAdmin || p.isSuperAdmin);
};

export const groupAdminVariants = async (sock, jid) => {
  const admins = await groupAdmins(sock, jid);
  return admins.reduce((set, participant) => {
    for (const item of jidVariants(participant.id, participant.lid, participant.phoneNumber)) {
      set.add(item);
    }
    return set;
  }, new Set());
};
