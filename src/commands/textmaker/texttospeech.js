import axios from 'axios';

export default {
  name: 'texttospeech',
  alias: ['tts'],
  category: 'text maker',
  description: 'Mengubah teks menjadi audio TTS.',
  cooldownMs: 5000,
  async execute({ sock, msg, args, prefix }) {
    const text = args.join(' ').trim();
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: `Contoh: ${prefix}tts halo dunia` }, { quoted: msg });
    // Download TTS audio ke buffer dulu, lalu kirim sebagai buffer
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=id&q=${encodeURIComponent(text.slice(0, 180))}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000
    });
    const buffer = Buffer.from(response.data);
    await sock.sendMessage(msg.key.remoteJid, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: msg });
  }
};
