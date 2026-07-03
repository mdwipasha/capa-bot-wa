export default {
  name: 'setname',
  alias: ['setsubject'],
  category: 'group',
  description: 'Mengubah nama grup.',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, args }) {
    const name = args.join(' ');
    if (!name) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan nama grup baru.' }, { quoted: msg });
    await sock.groupUpdateSubject(msg.key.remoteJid, name);
    return sock.sendMessage(msg.key.remoteJid, { text: 'Nama grup berhasil diubah.' }, { quoted: msg });
  }
};
