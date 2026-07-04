import axios from 'axios';
import { fbdown } from 'btch-downloader';

export default {
  name: 'facebook',
  alias: ['fb', 'fbdl', 'facebookdl'],
  category: 'downloader',
  description: 'Download video Facebook.',
  async execute({ sock, msg, args }) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan URL Facebook.\nContoh: /facebook https://www.facebook.com/...' }, { quoted: msg });
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Sedang mengunduh video Facebook...' }, { quoted: msg });
    
    try {
      const res = await fbdown(args[0]);
      const videoUrl = res.HD || res.Normal_video;
      if (!videoUrl) {
        throw new Error('Video tidak ditemukan atau link tidak valid.');
      }
      
      const response = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 20000
      });
      const buffer = Buffer.from(response.data);
      
      await sock.sendMessage(msg.key.remoteJid, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: res.title || 'Facebook Video'
      }, { quoted: msg });
    } catch (error) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ Gagal mendownload: ${error.message}` }, { quoted: msg });
    }
  }
};
