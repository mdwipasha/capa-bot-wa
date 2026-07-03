import { askChatGPT } from '../../lib/ai.js';

export default {
  name: 'chatgpt',
  alias: ['gpt', 'ai'],
  category: 'ai',
  description: 'Tanya ChatGPT.',
  async execute({ sock, msg, args }) {
    const prompt = args.join(' ');
    if (!prompt) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan pertanyaan.' }, { quoted: msg });
    const answer = await askChatGPT(prompt);
    return sock.sendMessage(msg.key.remoteJid, { text: answer }, { quoted: msg });
  }
};
