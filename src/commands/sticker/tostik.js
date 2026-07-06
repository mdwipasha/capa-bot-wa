import { textToWebp } from '../../lib/sticker.js';
import { requireText } from '../../utils/command.js';

export default {
  name: 'tostik',
  alias: ['brat', 'textsticker'],
  category: 'sticker',
  description: 'Membuat sticker teks polos.',
  cooldownMs: 3000,
  async execute({ sock, msg, args, prefix }) {
    const text = await requireText(sock, msg, args, `${prefix}tostik Pernah ga ready?`);
    if (!text) return;
    const sticker = await textToWebp(text);
    return sock.sendMessage(msg.key.remoteJid, { sticker }, { quoted: msg });
  }
};
