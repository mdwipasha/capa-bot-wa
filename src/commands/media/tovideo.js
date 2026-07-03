import { downloadQuotedOrCurrent } from '../../lib/quoted.js';

export default {
  name: 'tovideo',
  alias: ['tovid'],
  category: 'media',
  description: 'Mengirim ulang media sebagai video.',
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply video.' }, { quoted: msg });
    return sock.sendMessage(msg.key.remoteJid, { video: media.buffer, caption: 'Done' }, { quoted: msg });
  }
};
