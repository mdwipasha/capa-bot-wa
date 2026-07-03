export default {
  name: 'shutdown',
  alias: ['off'],
  category: 'owner',
  description: 'Mematikan bot.',
  ownerOnly: true,
  async execute({ sock, msg }) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot dimatikan.' }, { quoted: msg });
    setTimeout(() => process.exit(0), 800);
  }
};
