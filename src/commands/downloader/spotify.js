import axios from 'axios';
import { spotify } from 'btch-downloader';

export default {
  name: 'spotify',
  alias: ['spot', 'spotdl', 'spotifydl'],
  category: 'downloader',
  description: 'Download lagu Spotify.',
  async execute({ sock, msg, args }) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan URL Spotify.\nContoh: /spotify https://open.spotify.com/track/...' }, { quoted: msg });
    await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Sedang mengunduh audio dari Spotify...' }, { quoted: msg });
    
    try {
      const res = await spotify(args[0]);
      const result = res.result;
      if (!result) {
        throw new Error('Lagu tidak ditemukan atau link salah.');
      }
      
      // Look for a download url in formats
      const downloadUrl = result.formats?.[0]?.url || result.url;
      if (!downloadUrl) {
        throw new Error('Download URL tidak ditemukan.');
      }
      
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 30000
      });
      const buffer = Buffer.from(response.data);
      
      await sock.sendMessage(msg.key.remoteJid, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${result.title || 'Spotify'}.mp3`,
        ptt: false
      }, { quoted: msg });
    } catch (error) {
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ Gagal mendownload: ${error.message}` }, { quoted: msg });
    }
  }
};
