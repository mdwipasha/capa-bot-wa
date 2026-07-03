import { db } from '../database/index.js';
import { isGroupJid, senderNumber } from '../lib/message.js';
import { pickText } from '../utils/text.js';
import { logger } from '../utils/logger.js';

const linkRegex = /(chat\.whatsapp\.com|wa\.me|https?:\/\/|www\.)/i;
const spamCache = new Map();

export const runGroupGuards = async ({ sock, msg }) => {
  const from = msg.key.remoteJid;
  if (!isGroupJid(from) || msg.key.fromMe) return false;

  const data = await db.read();
  const text = pickText(msg).toLowerCase();
  const number = senderNumber(msg);
  const group = data.settings;

  if (group.mute[from]) return true;

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
    const key = `${from}:${number}`;
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
