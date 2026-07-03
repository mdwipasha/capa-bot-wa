export default {
  name: 'setdesc',
  alias: ['setdescription'],
  category: 'group',
  description: 'Mengubah deskripsi grup.',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, args }) {
    const desc = args.join(' ');
    if (!desc) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan deskripsi baru.' }, { quoted: msg });
    await sock.groupUpdateDescription(msg.key.remoteJid, desc);
    return sock.sendMessage(msg.key.remoteJid, { text: 'Deskripsi grup berhasil diubah.' }, { quoted: msg });
  }
};
