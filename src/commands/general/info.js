export default {
  name: 'info',
  alias: ['botinfo'],
  category: 'general',
  description: 'Informasi bot.',
  async execute({ sock, msg, config, botState }) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `*${config.botName}*\nNode: ${process.version}\nStatus: ${botState.isConnected ? 'Connected' : 'Disconnected'}\nPrefix: ${config.prefixes.join(', ')}`
    }, { quoted: msg });
  }
};
