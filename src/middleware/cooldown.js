import { config } from '../config/env.js';
import { senderNumber } from '../lib/message.js';
import { now } from '../utils/time.js';

const cooldowns = new Map();

export const checkCooldown = (msg, command) => {
  const key = `${senderNumber(msg)}:${command.name}`;
  const waitMs = command.cooldownMs ?? config.cooldownMs;
  const last = cooldowns.get(key) || 0;
  const diff = now() - last;
  if (diff < waitMs) return Math.ceil((waitMs - diff) / 1000);
  cooldowns.set(key, now());
  return 0;
};
