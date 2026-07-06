import { textToAnimatedSticker } from '../../lib/sticker.js';
import { requireText } from '../../utils/command.js';

export default {
  name: 'togif',
  alias: ['textgif', 'giftext'],
  category: 'sticker',
  description: 'Membuat GIF animasi dari teks.',
  cooldownMs: 5000,
  async execute({ sock, msg, args, prefix }) {
    const text = await requireText(sock, msg, args, `${prefix}togif Halo dunia`);
    if (!text) return;
    const sticker = await textToAnimatedSticker(text);
    return sock.sendMessage(msg.key.remoteJid, { sticker }, { quoted: msg });
  }
};
