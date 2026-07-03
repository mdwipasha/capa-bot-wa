import fs from 'fs-extra';
import { ytDlpDownload } from '../../lib/downloader.js';

export default {
  name: 'ytmp4',
  alias: ['ytv'],
  category: 'downloader',
  description: 'Download YouTube MP4.',
  async execute({ sock, msg, args }) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan URL YouTube.' }, { quoted: msg });
    const result = await ytDlpDownload(args[0], 'video');
    try {
      return await sock.sendMessage(msg.key.remoteJid, { video: { url: result.filePath }, caption: result.title }, { quoted: msg });
    } finally {
      await fs.remove(result.cleanupDir).catch(() => {});
    }
  }
};
