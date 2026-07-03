import { downloadQuotedOrCurrent } from '../../lib/quoted.js';
import { imageToWebp } from '../../lib/sticker.js';

export default {
  name: 'sticker',
  alias: ['s', 'stiker'],
  category: 'sticker',
  description: 'Membuat sticker dari gambar/video.',
  async execute({ sock, msg, args, config }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media) return sock.sendMessage(msg.key.remoteJid, { text: 'Kirim/reply gambar atau video.' }, { quoted: msg });
    const sticker = media.mime.startsWith('image/') ? await imageToWebp(media.buffer) : media.buffer;
    return sock.sendMessage(msg.key.remoteJid, { sticker }, { quoted: msg });
  }
};
