export default {
  name: 'ping',
  alias: ['p'],
  category: 'general',
  description: 'Cek respons bot.',
  async execute({ sock, msg }) {
    const start = Date.now();
    const sent = await sock.sendMessage(msg.key.remoteJid, { text: 'Pong...' }, { quoted: msg });
    await sock.sendMessage(msg.key.remoteJid, { text: `Pong ${Date.now() - start}ms`, edit: sent.key });
  }
};
