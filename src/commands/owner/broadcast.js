export default {
  name: 'broadcast',
  alias: ['bc'],
  category: 'owner',
  description: 'Broadcast ke semua chat tersimpan.',
  ownerOnly: true,
  async execute({ sock, msg, args, db }) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan pesan broadcast.' }, { quoted: msg });
    const data = await db.read();
    const chats = Object.keys(data.chats || {});
    let sent = 0;
    for (const jid of chats) {
      await sock.sendMessage(jid, { text: `*Broadcast*\n\n${text}` }).then(() => { sent += 1; }).catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return sock.sendMessage(msg.key.remoteJid, { text: `Broadcast terkirim ke ${sent}/${chats.length} chat.` }, { quoted: msg });
  }
};
