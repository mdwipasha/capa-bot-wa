import { config } from '../config/env.js';
import { db } from '../database/index.js';
import { checkCooldown } from '../middleware/cooldown.js';
import { checkPermissions } from '../middleware/permissions.js';
import { rateLimit, validateInput } from '../middleware/security.js';
import { reply } from '../lib/message.js';
import { runGroupGuards } from './groupGuard.js';
import { logger } from '../utils/logger.js';
import { pickText, sanitizeText } from '../utils/text.js';

export const createCommandHandler = ({ loader, botState }) => async ({ sock, msg }) => {
  try {
    if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

    await db.update((store) => {
      store.stats.messages += 1;
      store.chats[msg.key.remoteJid] = { lastMessageAt: Date.now() };
      const participant = msg.key.participant || msg.key.remoteJid;
      store.users[participant] = { lastSeenAt: Date.now() };
    });

    if (await runGroupGuards({ sock, msg })) return;

    const text = sanitizeText(pickText(msg));
    if (!validateInput(text)) return reply(sock, msg, 'Input tidak valid.');

    const prefix = config.prefixes.find((item) => text.startsWith(item));
    if (!prefix) return;

    const [rawName, ...args] = text.slice(prefix.length).trim().split(/\s+/);
    const commandName = rawName?.toLowerCase();
    if (!commandName) return;

    const command = loader.get(commandName);
    if (!command) return;

    const limited = await rateLimit(msg);
    if (!limited.allowed) return reply(sock, msg, limited.reason);

    const permissionError = await checkPermissions({ sock, msg, command });
    if (permissionError) return reply(sock, msg, permissionError);

    const wait = checkCooldown(msg, command);
    if (wait) return reply(sock, msg, `Tunggu ${wait} detik sebelum memakai command ini lagi.`);

    await db.update((store) => { store.stats.commands += 1; });
    logger.info(`Command ${command.name} from ${msg.key.remoteJid}`);
    await command.execute({ sock, msg, args, text, prefix, commandName, loader, db, config, botState });
  } catch (error) {
    logger.error('Command handler error', error.stack || error.message);
    await reply(sock, msg, `Terjadi error: ${error.message}`).catch(() => {});
  }
};
