import jsQR from 'jsqr';
import sharp from 'sharp';
import { downloadQuotedOrCurrent } from '../../lib/quoted.js';

export default {
  name: 'qrreader',
  alias: ['readqr', 'scanqr'],
  category: 'converter',
  description: 'Membaca QR code dari gambar.',
  cooldownMs: 3000,
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media?.mime.startsWith('image/')) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply gambar QR code.' }, { quoted: msg });
    const raw = await sharp(media.buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const result = jsQR(new Uint8ClampedArray(raw.data), raw.info.width, raw.info.height);
    return sock.sendMessage(msg.key.remoteJid, { text: result?.data || 'QR tidak terbaca.' }, { quoted: msg });
  }
};
