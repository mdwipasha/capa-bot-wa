import { askClaude } from '../../lib/ai.js';

export default {
  name: 'claude',
  alias: [],
  category: 'ai',
  description: 'Tanya Claude.',
  async execute({ sock, msg, args }) {
    const prompt = args.join(' ');
    if (!prompt) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan pertanyaan.' }, { quoted: msg });
    const answer = await askClaude(prompt);
    return sock.sendMessage(msg.key.remoteJid, { text: answer }, { quoted: msg });
  }
};
