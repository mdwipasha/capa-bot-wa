import { db } from '../database/index.js';
import { downloadMedia, isGroupJid, senderNumber } from '../lib/message.js';
import { pickText, mentionedJids } from '../utils/text.js';
import { logger } from '../utils/logger.js';
import { imageToWebp } from '../lib/sticker.js';
import { detectLanguage } from '../services/textService.js';

const linkRegex = /(chat\.whatsapp\.com|wa\.me|https?:\/\/|www\.)/i;
const spamCache = new Map();

export const runGroupGuards = async ({ sock, msg }) => {
  const from = msg.key.remoteJid;
  if (!isGroupJid(from) || msg.key.fromMe) return false;

  const data = await db.read();
  const text = pickText(msg).toLowerCase();
  const number = senderNumber(msg);
  const group = data.settings;

  if (group.autoread?.[from]) await sock.readMessages([msg.key]).catch(() => {});
  if (group.autoreact?.[from] && text) await sock.sendMessage(from, { react: { text: '👍', key: msg.key } }).catch(() => {});
  if (group.autoreply?.[from] && text.includes('bot')) {
    await sock.sendMessage(from, { text: 'Auto reply aktif. Ketik menu untuk melihat command.' }, { quoted: msg }).catch(() => {});
  }
  if (group.autodetectlang?.[from] && text.length > 10) {
    await sock.sendMessage(from, { text: `Bahasa terdeteksi: ${detectLanguage(text)}` }, { quoted: msg }).catch(() => {});
  }
  if (group.autosticker?.[from]) {
    const media = await downloadMedia(msg).catch(() => null);
    if (media?.mime.startsWith('image/')) {
      const sticker = await imageToWebp(media.buffer).catch(() => null);
      if (sticker) await sock.sendMessage(from, { sticker }, { quoted: msg }).catch(() => {});
    }
  }

  if (group.mute[from]) return true;

  if (group.antitagall?.[from] && mentionedJids(msg).length >= 5) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `@${number} tag massal tidak diizinkan.`, mentions: [msg.key.participant] });
    return true;
  }

  if (group.antifakenumber?.[from] && msg.key.participant && !number.startsWith('62')) {
    await sock.groupParticipantsUpdate(from, [msg.key.participant], 'remove').catch(() => {});
    return true;
  }

  if (group.antilink[from] && linkRegex.test(text)) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `@${number} link tidak diizinkan di grup ini.`, mentions: [msg.key.participant] });
    return true;
  }

  if (group.antibadword[from] && group.badwords.some((word) => text.includes(word))) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    await sock.sendMessage(from, { text: `@${number} kata kasar terdeteksi.`, mentions: [msg.key.participant] });
    return true;
  }

  if (group.antispam[from]) {
    const key = `${msg.__sessionId || 'default'}:${from}:${number}`;
    const rec = spamCache.get(key) || { count: 0, last: 0 };
    const now = Date.now();
    rec.count = now - rec.last < 2500 ? rec.count + 1 : 1;
    rec.last = now;
    spamCache.set(key, rec);
    if (rec.count >= 5) {
      await sock.groupParticipantsUpdate(from, [msg.key.participant], 'remove').catch((error) => {
        logger.warn(`Gagal kick spammer ${number}: ${error.message}`);
      });
      return true;
    }
  }

  return false;
};
