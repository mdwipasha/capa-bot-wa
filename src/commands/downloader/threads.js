import axios from 'axios';
import { threads } from 'btch-downloader';

export default {
  name: 'threads',
  alias: ['thread', 'threaddl'],
  category: 'downloader',
  description: 'Download video/foto Threads.',
  async execute({ sock, msg, args }) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan URL Threads.\nContoh: /threads https://www.threads.net/t/...' }, { quoted: msg });
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Sedang mengunduh media Threads...' }, { quoted: msg });
    
    try {
      const res = await threads(args[0]);
      const result = res.result;
      if (!result) {
        throw new Error('Media tidak ditemukan.');
      }
      
      const mediaUrl = result.type === 'video' ? result.video : result.image;
      if (!mediaUrl) {
        throw new Error('Link media kosong.');
      }
      
      const response = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 20000
      });
      const buffer = Buffer.from(response.data);
      
      if (result.type === 'video') {
        await sock.sendMessage(msg.key.remoteJid, {
          video: buffer,
          mimetype: 'video/mp4',
          caption: 'Threads Video'
        }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.key.remoteJid, {
          image: buffer,
          caption: 'Threads Image'
        }, { quoted: msg });
      }
    } catch (error) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ Gagal mendownload: ${error.message}` }, { quoted: msg });
    }
  }
};
