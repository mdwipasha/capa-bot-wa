import { downloadQuotedOrCurrent } from '../../lib/quoted.js';
import { imageEffect } from '../../services/mediaService.js';

export default {
  name: 'pixelart',
  alias: ['pixel'],
  category: 'image',
  description: 'Mengubah gambar menjadi pixel art.',
  cooldownMs: 5000,
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media?.mime.startsWith('image/')) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply gambar.' }, { quoted: msg });
    const image = await imageEffect(media.buffer, 'pixel');
    return sock.sendMessage(msg.key.remoteJid, { image, caption: 'Pixel art selesai.' }, { quoted: msg });
  }
};
