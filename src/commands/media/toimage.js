import { downloadQuotedOrCurrent } from '../../lib/quoted.js';

export default {
  name: 'toimage',
  alias: ['toimg'],
  category: 'media',
  description: 'Mengubah sticker/image menjadi gambar.',
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply media.' }, { quoted: msg });
    return sock.sendMessage(msg.key.remoteJid, { image: media.buffer, caption: 'Done' }, { quoted: msg });
  }
};
