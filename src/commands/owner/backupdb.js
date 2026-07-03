import fs from 'fs-extra';
import { config } from '../../config/env.js';

export default {
  name: 'backupdb',
  alias: ['backup'],
  category: 'owner',
  description: 'Backup database JSON.',
  ownerOnly: true,
  async execute({ sock, msg }) {
    await fs.ensureDir('backups');
    const file = `backups/database-${Date.now()}.json`;
    await fs.copy(config.databasePath, file);
    await sock.sendMessage(msg.key.remoteJid, { document: { url: file }, fileName: file.split('/').pop(), mimetype: 'application/json' }, { quoted: msg });
  }
};
