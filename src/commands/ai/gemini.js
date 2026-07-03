import { askGemini } from '../../lib/ai.js';

export default {
  name: 'gemini',
  alias: [],
  category: 'ai',
  description: 'Tanya Gemini.',
  async execute({ sock, msg, args }) {
    const prompt = args.join(' ');
    if (!prompt) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan pertanyaan.' }, { quoted: msg });
    const answer = await askGemini(prompt);
    return sock.sendMessage(msg.key.remoteJid, { text: answer }, { quoted: msg });
  }
};
