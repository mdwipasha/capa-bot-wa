import axios from 'axios';
import { youtube } from 'btch-downloader';

export default {
  name: 'ytmp4',
  alias: ['ytv', 'ytmp4dl'],
  category: 'downloader',
  description: 'Download YouTube MP4.',
  async execute({ sock, msg, args }) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan URL YouTube.\nContoh: /ytmp4 https://www.youtube.com/watch?v=...' }, { quoted: msg });
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Sedang mengunduh video YouTube...' }, { quoted: msg });
    
    try {
      const res = await youtube(args[0]);
      const downloadUrl = res.mp4;
      if (!downloadUrl) {
        throw new Error('Link video tidak ditemukan.');
      }
      
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 30000
      });
      const buffer = Buffer.from(response.data);
      
      return await sock.sendMessage(msg.key.remoteJid, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: res.title || 'YouTube Video'
      }, { quoted: msg });
    } catch (error) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ Gagal mendownload video: ${error.message}` }, { quoted: msg });
    }
  }
};
