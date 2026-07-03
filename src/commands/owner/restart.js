export default {
  name: 'restart',
  alias: ['reboot'],
  category: 'owner',
  description: 'Restart bot.',
  ownerOnly: true,
  async execute({ sock, msg }) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Restarting...' }, { quoted: msg });
    setTimeout(() => process.exit(0), 800);
  }
};
