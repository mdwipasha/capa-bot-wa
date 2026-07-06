import { qrBuffer } from '../../services/textService.js';
import { requireText } from '../../utils/command.js';

export default {
  name: 'qrgenerator',
  alias: ['qr', 'makeqr'],
  category: 'converter',
  description: 'Membuat QR code dari teks atau URL.',
  cooldownMs: 3000,
  async execute({ sock, msg, args, prefix }) {
    const text = await requireText(sock, msg, args, `${prefix}qr https://example.com`);
    if (!text) return;
    const buffer = await qrBuffer(text);
    await sock.sendMessage(msg.key.remoteJid, { image: buffer, caption: 'QR code berhasil dibuat.' }, { quoted: msg });
  }
};
