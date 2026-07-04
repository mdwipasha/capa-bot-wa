import { downloadQuotedOrCurrent } from '../../lib/quoted.js';
import { stickerToPng } from '../../lib/sticker.js';

export default {
  name: 'simage',
  alias: ['stickertoimage', 'sticker2img', 'toimg'],
  category: 'sticker',
  description: 'Mengubah sticker menjadi gambar PNG.',
  cooldownMs: 3000,
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media || media.type !== 'stickerMessage') {
      return sock.sendMessage(msg.key.remoteJid, { text: 'Reply sticker yang ingin dijadikan gambar.' }, { quoted: msg });
    }
    const image = await stickerToPng(media.buffer);
    return sock.sendMessage(msg.key.remoteJid, { image, caption: 'Sticker berhasil dijadikan gambar.' }, { quoted: msg });
  }
};
