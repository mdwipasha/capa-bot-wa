import { downloadQuotedOrCurrent } from '../../lib/quoted.js';
import { imageEffect } from '../../services/mediaService.js';

export default {
  name: 'cartoon',
  alias: ['cartoonfilter', 'animefilter'],
  category: 'image',
  description: 'Memberi efek cartoon/anime ringan pada gambar.',
  cooldownMs: 5000,
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media?.mime.startsWith('image/')) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply gambar.' }, { quoted: msg });
    const image = await imageEffect(media.buffer, 'cartoon');
    return sock.sendMessage(msg.key.remoteJid, { image, caption: 'Cartoon filter selesai.' }, { quoted: msg });
  }
};
