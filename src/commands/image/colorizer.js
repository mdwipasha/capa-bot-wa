import { downloadQuotedOrCurrent } from '../../lib/quoted.js';
import { imageEffect } from '../../services/mediaService.js';

export default {
  name: 'colorizer',
  alias: ['colorize'],
  category: 'image',
  description: 'Meningkatkan saturasi warna foto.',
  cooldownMs: 5000,
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media?.mime.startsWith('image/')) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply gambar.' }, { quoted: msg });
    const image = await imageEffect(media.buffer, 'colorize');
    return sock.sendMessage(msg.key.remoteJid, { image, caption: 'Colorizer selesai.' }, { quoted: msg });
  }
};
