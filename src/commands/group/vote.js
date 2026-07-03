import { sendReply } from '../../utils/command.js';

export default {
  name: 'vote',
  alias: ['voting'],
  category: 'group',
  description: 'Membuat vote sederhana. Contoh: vote pertanyaan | opsi1 | opsi2',
  groupOnly: true,
  cooldownMs: 3000,
  async execute({ sock, msg, args, prefix, db }) {
    const parts = args.join(' ').split('|').map((item) => item.trim()).filter(Boolean);
    if (parts.length < 3) return sendReply(sock, msg, `Contoh: ${prefix}vote Makan apa? | Bakso | Mie`);
    const [question, ...options] = parts;
    await db.update((store) => {
      store.votes ??= {};
      store.votes[msg.key.remoteJid] = { question, options, votes: {}, createdAt: Date.now() };
    });
    await sendReply(sock, msg, `Vote dibuat:\n*${question}*\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nBalas dengan ${prefix}polling nomor`);
  }
};
