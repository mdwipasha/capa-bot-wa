import { downloadQuotedOrCurrent } from '../../lib/quoted.js';

export default {
  name: 'setppgroup',
  alias: ['setppgc'],
  category: 'group',
  description: 'Mengubah foto profil grup.',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg }) {
    const media = await downloadQuotedOrCurrent(msg);
    if (!media?.mime.startsWith('image/')) return sock.sendMessage(msg.key.remoteJid, { text: 'Reply gambar untuk dijadikan foto grup.' }, { quoted: msg });
    await sock.updateProfilePicture(msg.key.remoteJid, media.buffer);
    return sock.sendMessage(msg.key.remoteJid, { text: 'Foto grup berhasil diubah.' }, { quoted: msg });
  }
};
