import fs from 'fs-extra';
import { getQuotedMessage } from '../../lib/quoted.js';
import { downloadMedia } from '../../lib/message.js';
import { config } from '../../config/env.js';

export default {
  name: 'restoredb',
  alias: ['restore'],
  category: 'owner',
  description: 'Restore database dari file JSON yang di-reply.',
  ownerOnly: true,
  cooldownMs: 0,
  async execute({ sock, msg }) {
    const quoted = getQuotedMessage(msg);
    if (!quoted) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply file database JSON hasil backup.' }, { quoted: msg });
    const media = await downloadMedia(quoted);
    if (!media) return sock.sendMessage(msg.key.remoteJid, { text: 'File tidak bisa diambil.' }, { quoted: msg });
    JSON.parse(media.buffer.toString('utf8'));
    await fs.copy(config.databasePath, `backups/database-before-restore-${Date.now()}.json`).catch(() => {});
    await fs.writeFile(config.databasePath, media.buffer);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Database berhasil direstore. Restart bot agar semua cache segar.' }, { quoted: msg });
  }
};
