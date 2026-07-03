export default {
  name: 'hidetag',
  alias: ['htag'],
  category: 'group',
  description: 'Kirim pesan dengan mention tersembunyi.',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, args }) {
    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    await sock.sendMessage(msg.key.remoteJid, {
      text: args.join(' ') || ' ',
      mentions: metadata.participants.map((p) => p.id)
    }, { quoted: msg });
  }
};
