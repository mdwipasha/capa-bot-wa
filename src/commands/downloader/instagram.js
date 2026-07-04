import axios from 'axios';
import { igdl } from 'btch-downloader';

export default {
  name: 'instagram',
  alias: ['ig', 'igdl', 'instagramdl'],
  category: 'downloader',
  description: 'Download foto/video Instagram.',
  async execute({ sock, msg, args }) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan URL Instagram.\nContoh: /instagram https://www.instagram.com/p/...' }, { quoted: msg });
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Sedang mengunduh media dari Instagram...' }, { quoted: msg });
    
    try {
      const res = await igdl(args[0]);
      if (!res.result || res.result.length === 0) {
        throw new Error('Media tidak ditemukan atau akun di-private.');
      }

      for (const item of res.result) {
        const mediaUrl = item.url;
        const response = await axios.get(mediaUrl, {
          responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 20000
        });
        const buffer = Buffer.from(response.data);
        
        // Detect if video or image by headers or url ending
        const contentType = response.headers['content-type'] || '';
        const isVideo = contentType.includes('video') || mediaUrl.includes('.mp4');
        
        if (isVideo) {
          await sock.sendMessage(msg.key.remoteJid, { video: buffer, mimetype: 'video/mp4' }, { quoted: msg });
        } else {
          await sock.sendMessage(msg.key.remoteJid, { image: buffer }, { quoted: msg });
        }
      }
    } catch (error) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ Gagal mendownload: ${error.message}` }, { quoted: msg });
    }
  }
};
