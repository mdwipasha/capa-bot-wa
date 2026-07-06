import fs from 'fs-extra';
import { instagramDownload } from '../../lib/downloader.js';

export default {
  name: 'instagram',
  alias: ['ig', 'igdl'],
  category: 'downloader',
  description: 'Download video/reels Instagram.',
  cooldownMs: 15000,
  async execute({ sock, msg, args }) {
    const from = msg.key.remoteJid;
    const url = args[0];

    if (!url) {
      return sock.sendMessage(from, {
        text: '📥 *Instagram Downloader*\n\nMasukkan URL Instagram.\n\n*Contoh:*\n.instagram https://www.instagram.com/reel/xxxxx'
      }, { quoted: msg });
    }

    if (!url.includes('instagram.com')) {
      return sock.sendMessage(from, { text: '❌ URL tidak valid. Gunakan link dari instagram.com' }, { quoted: msg });
    }

    await sock.sendMessage(from, { text: '⏳ Sedang mengunduh video Instagram, harap tunggu...' }, { quoted: msg });

    const result = await instagramDownload(url);
    try {
      return await sock.sendMessage(from, {
        video: { url: result.filePath },
        caption: `📥 *${result.title || 'Instagram Video'}*\n\n_via Instagram Downloader_`
      }, { quoted: msg });
    } finally {
      await fs.remove(result.cleanupDir).catch(() => {});
    }
  }
};
