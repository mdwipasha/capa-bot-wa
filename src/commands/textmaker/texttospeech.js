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
    await sock.sendMessage(msg.key.remoteJid, { audio: { url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
  }
};
