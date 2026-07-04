import { config } from '../config/env.js';
import { db } from '../database/index.js';
import { senderNumber } from '../lib/message.js';
import { now } from '../utils/time.js';

const userHits = new Map();

export const rateLimit = async (msg) => {
  const number = senderNumber(msg);
  const data = await db.read();
  if (data.blocked[number]) return { allowed: false, reason: 'Nomor ini diblokir karena spam.' };
  const key = `${msg.__sessionId || 'default'}:${number}`;
  const record = userHits.get(key) || { count: 0, resetAt: now() + config.spamWindowMs };
  if (now() > record.resetAt) {
    record.count = 0;
    record.resetAt = now() + config.spamWindowMs;
  }
  record.count += 1;
  userHits.set(key, record);
  if (record.count >= config.spamBlockHits) {
    return { allowed: false, reason: 'Auto block: aktivitas spam terdeteksi.' };
  }
  if (record.count > config.spamMaxHits) return { allowed: false, reason: 'Terlalu cepat. Coba lagi sebentar.' };
  return { allowed: true };
};

export const validateInput = (text = '') => text.length <= 4096 && !text.includes('\u0000');
