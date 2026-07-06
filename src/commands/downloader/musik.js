import fs from 'fs-extra';
import { musicSearch } from '../../lib/downloader.js';

export default {
  name: 'musik',
  alias: ['lagu', 'music', 'song'],
  category: 'downloader',
  description: 'Download lagu berdasarkan nama.',
  cooldownMs: 20000,
  async execute({ sock, msg, args }) {
    const from = msg.key.remoteJid;
    const query = args.join(' ').trim();

    if (!query) {
      return sock.sendMessage(from, {
        text: '🎵 *Download Lagu*\n\nMasukkan nama lagu yang ingin didownload.\n\n*Contoh:*\n.musik Shape of You Ed Sheeran\n.lagu Bohemian Rhapsody Queen\n\n💡 Semakin spesifik nama + artis, semakin akurat hasilnya.'
      }, { quoted: msg });
    }

    await sock.sendMessage(from, {
      text: `🔍 Mencari *"${query}"*...\n⏳ Harap tunggu, proses download sedang berjalan.`
    }, { quoted: msg });

    const result = await musicSearch(query);
    try {
      return await sock.sendMessage(from, {
        audio: { url: result.filePath },
        mimetype: result.mime,
        fileName: `${result.title}.${result.ext}`,
        ptt: false
      }, { quoted: msg });
    } finally {
      await fs.remove(result.cleanupDir).catch(() => {});
    }
  }
};
