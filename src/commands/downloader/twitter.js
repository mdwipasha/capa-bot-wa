import axios from 'axios';
import { twitter } from 'btch-downloader';

export default {
  name: 'twitter',
  alias: ['tw', 'twdl', 'twitterdl', 'x', 'xdl'],
  category: 'downloader',
  description: 'Download video Twitter/X.',
  async execute({ sock, msg, args }) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan URL Twitter/X.\nContoh: /twitter https://x.com/...' }, { quoted: msg });
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Sedang mengunduh media Twitter/X...' }, { quoted: msg });
    
    try {
      const res = await twitter(args[0]);
      let videoUrl = '';
      
      if (Array.isArray(res.url)) {
        // Handle array of URLs or quality objects
        const first = res.url[0];
        videoUrl = typeof first === 'string' ? first : (first?.url || first?.link || '');
      } else {
        videoUrl = res.url;
      }
      
      if (!videoUrl) {
        throw new Error('Video/media tidak ditemukan.');
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
        caption: res.title || 'Twitter Video'
      }, { quoted: msg });
    } catch (error) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ Gagal mendownload: ${error.message}` }, { quoted: msg });
    }
  }
};
