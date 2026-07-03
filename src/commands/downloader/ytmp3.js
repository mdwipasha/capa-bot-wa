import fs from 'fs-extra';
import { ytDlpDownload } from '../../lib/downloader.js';

export default {
  name: 'ytmp3',
  alias: ['yta'],
  category: 'downloader',
  description: 'Download YouTube MP3.',
  async execute({ sock, msg, args }) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan URL YouTube.' }, { quoted: msg });
    const result = await ytDlpDownload(args[0], 'audio');
    try {
      return await sock.sendMessage(msg.key.remoteJid, { audio: { url: result.filePath }, mimetype: result.mime, fileName: result.title }, { quoted: msg });
    } finally {
      await fs.remove(result.cleanupDir).catch(() => {});
    }
  }
};
