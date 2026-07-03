import { imageToWebp } from '../../lib/sticker.js';
import { requireText } from '../../utils/command.js';

export default {
  name: 'emoji',
  alias: ['emojisticker'],
  category: 'sticker',
  description: 'Membuat sticker dari emoji.',
  cooldownMs: 3000,
  async execute({ sock, msg, args, prefix }) {
    const emoji = await requireText(sock, msg, args, `${prefix}emoji 😄`);
    if (!emoji) return;
    const svg = Buffer.from(`<svg width="512" height="512"><text x="256" y="360" text-anchor="middle" font-size="300">${emoji.slice(0, 4)}</text></svg>`);
    const sticker = await imageToWebp(svg);
    return sock.sendMessage(msg.key.remoteJid, { sticker }, { quoted: msg });
  }
};
