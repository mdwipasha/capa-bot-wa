import { downloadQuotedOrCurrent } from '../../lib/quoted.js';
import { imageEffect } from '../../services/mediaService.js';

export default {
  name: 'sketch',
  alias: ['sketchfilter'],
  category: 'image',
  description: 'Memberi efek sketch pada gambar.',
  cooldownMs: 5000,
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media?.mime.startsWith('image/')) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply gambar.' }, { quoted: msg });
    const image = await imageEffect(media.buffer, 'sketch');
    return sock.sendMessage(msg.key.remoteJid, { image, caption: 'Sketch filter selesai.' }, { quoted: msg });
  }
};
