import { downloadQuotedOrCurrent } from '../../lib/quoted.js';

export default {
  name: 'toaudio',
  alias: ['tomp3'],
  category: 'media',
  description: 'Mengirim ulang media sebagai audio.',
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply audio/video.' }, { quoted: msg });
    return sock.sendMessage(msg.key.remoteJid, { audio: media.buffer, mimetype: 'audio/mpeg' }, { quoted: msg });
  }
};
