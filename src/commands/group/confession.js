import { sendReply } from '../../utils/command.js';

export default {
  name: 'confession',
  alias: ['confess'],
  category: 'group',
  description: 'Mengirim confession anonim di grup.',
  groupOnly: true,
  cooldownMs: 10000,
  async execute({ sock, msg, args, prefix }) {
    const text = args.join(' ').trim();
    if (!text) return sendReply(sock, msg, `Contoh: ${prefix}confession aku suka seseorang di grup ini`);
    await sock.sendMessage(msg.key.remoteJid, { text: `*Confession Anonim*\n\n${text}` });
  }
};
