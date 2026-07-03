export default {
  name: 'speed',
  alias: ['latency'],
  category: 'general',
  description: 'Tes latency bot.',
  async execute({ sock, msg }) {
    const start = performance.now();
    await sock.sendPresenceUpdate('composing', msg.key.remoteJid);
    await sock.sendMessage(msg.key.remoteJid, { text: `Speed: ${(performance.now() - start).toFixed(2)}ms` }, { quoted: msg });
  }
};
