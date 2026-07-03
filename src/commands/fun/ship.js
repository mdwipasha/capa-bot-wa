import { sendReply } from '../../utils/command.js';

export default {
  name: 'ship',
  alias: ['jodoh'],
  category: 'fun',
  description: 'Menghitung kecocokan dua nama.',
  cooldownMs: 2000,
  async execute({ sock, msg, args, prefix }) {
    const parts = args.join(' ').split('|').map((item) => item.trim());
    if (parts.length < 2 || !parts[0] || !parts[1]) return sendReply(sock, msg, `Contoh: ${prefix}ship Budi | Ani`);
    await sendReply(sock, msg, `${parts[0]} x ${parts[1]}\nKecocokan: ${Math.floor(Math.random() * 101)}%`);
  }
};
