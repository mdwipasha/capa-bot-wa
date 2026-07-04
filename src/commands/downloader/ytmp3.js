import axios from 'axios';
import { youtube } from 'btch-downloader';

export default {
  name: 'ytmp3',
  alias: ['yta', 'ytmp3dl'],
  category: 'downloader',
  description: 'Download YouTube MP3.',
  async execute({ sock, msg, args }) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan URL YouTube.\nContoh: /ytmp3 https://www.youtube.com/watch?v=...' }, { quoted: msg });
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Sedang mengunduh audio YouTube...' }, { quoted: msg });
    
    try {
      const res = await youtube(args[0]);
      const downloadUrl = res.mp3;
      if (!downloadUrl) {
        throw new Error('Link audio tidak ditemukan.');
      }
      
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 30000
      });
      const buffer = Buffer.from(response.data);
      
      return await sock.sendMessage(msg.key.remoteJid, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${res.title || 'audio'}.mp3`,
        ptt: false
      }, { quoted: msg });
    } catch (error) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ Gagal mendownload audio: ${error.message}` }, { quoted: msg });
    }
  }
};
