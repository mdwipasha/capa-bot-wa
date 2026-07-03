import { downloadQuotedOrCurrent } from '../../lib/quoted.js';
import { imageToPdf } from '../../services/mediaService.js';

export default {
  name: 'imagetopdf',
  alias: ['img2pdf'],
  category: 'converter',
  description: 'Mengubah gambar menjadi PDF.',
  cooldownMs: 5000,
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media?.mime.startsWith('image/')) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply gambar yang ingin dijadikan PDF.' }, { quoted: msg });
    const pdf = await imageToPdf(media.buffer);
    return sock.sendMessage(msg.key.remoteJid, { document: pdf, mimetype: 'application/pdf', fileName: 'image.pdf' }, { quoted: msg });
  }
};
