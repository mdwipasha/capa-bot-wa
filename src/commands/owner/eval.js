export default {
  name: 'eval',
  alias: ['>'],
  category: 'owner',
  description: 'Evaluasi JavaScript.',
  ownerOnly: true,
  cooldownMs: 0,
  async execute({ sock, msg, args }) {
    const code = args.join(' ');
    if (!code) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan kode JavaScript.' }, { quoted: msg });
    const result = await eval(`(async()=>{${code}})()`);
    return sock.sendMessage(msg.key.remoteJid, { text: String(result ?? 'undefined').slice(0, 4000) }, { quoted: msg });
  }
};
