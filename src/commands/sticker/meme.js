import { downloadQuotedOrCurrent } from '../../lib/quoted.js';
import { imageToWebp, memeImage } from '../../lib/sticker.js';

export default {
  name: 'meme',
  alias: ['stickermeme'],
  category: 'sticker',
  description: 'Membuat sticker meme. Format: atas|bawah',
  async execute({ sock, msg, args }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media?.mime.startsWith('image/')) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply gambar dengan teks: atas|bawah' }, { quoted: msg });
    const [top = '', bottom = ''] = args.join(' ').split('|');
    const image = await memeImage(media.buffer, top, bottom);
    const sticker = await imageToWebp(image);
    return sock.sendMessage(msg.key.remoteJid, { sticker }, { quoted: msg });
  }
};
