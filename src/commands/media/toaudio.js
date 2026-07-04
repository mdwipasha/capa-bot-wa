import { downloadQuotedOrCurrent } from '../../lib/quoted.js';

export default {
  name: 'toaudio',
  alias: ['tomp3'],
  category: 'media',
  description: 'Mengirim ulang media sebagai audio.',
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply audio/video.' }, { quoted: msg });
    // Kirim sebagai audio/mp4 agar lebih kompatibel di WhatsApp
    const mimetype = media.mime?.includes('mp3') || media.mime?.includes('mpeg') ? 'audio/mpeg' : 'audio/mp4';
    return sock.sendMessage(msg.key.remoteJid, {
      audio: media.buffer,
      mimetype,
      ptt: false
    }, { quoted: msg });
  }
};
