export default {
  name: 'reloadcommands',
  alias: ['cmdreload', 'reloadcmd'],
  category: 'owner',
  description: 'Reload semua command tanpa restart.',
  ownerOnly: true,
  cooldownMs: 0,
  async execute({ sock, msg, loader }) {
    await loader.load();
    await sock.sendMessage(msg.key.remoteJid, { text: `Command berhasil di-reload. Total: ${loader.list().length}` }, { quoted: msg });
  }
};
