export default {
  name: 'owner',
  alias: ['creator'],
  category: 'general',
  description: 'Menampilkan kontak owner.',
  async execute({ sock, msg, config }) {
    const text = config.ownerNumber ? `Owner: wa.me/${config.ownerNumber}` : 'Owner belum diatur di .env';
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};
