import fs from 'fs-extra';
import { ytDlpDownload } from '../../lib/downloader.js';

export default {
  name: 'facebook',
  alias: ['fb'],
  category: 'downloader',
  description: 'Download video Facebook.',
  async execute({ sock, msg, args }) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan URL Facebook.' }, { quoted: msg });
    const result = await ytDlpDownload(args[0], 'video');
    try {
      return await sock.sendMessage(msg.key.remoteJid, { video: { url: result.filePath }, caption: result.title }, { quoted: msg });
    } finally {
      await fs.remove(result.cleanupDir).catch(() => {});
    }
  }
};
