import axios from 'axios';
import { requireText } from '../../utils/command.js';

export default {
  name: 'texttospeech',
  alias: ['tts'],
  category: 'text maker',
  description: 'Mengubah teks menjadi audio TTS.',
  cooldownMs: 5000,
  async execute({ sock, msg, args, prefix }) {
    const text = await requireText(sock, msg, args, `${prefix}tts halo dunia`);
    if (!text) return;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=id&q=${encodeURIComponent(text.slice(0, 180))}`;
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
        referer: 'https://translate.google.com/'
      }
    });
    await sock.sendMessage(msg.key.remoteJid, {
      audio: Buffer.from(data),
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: 'tts.mp3'
    }, { quoted: msg });
  }
};
