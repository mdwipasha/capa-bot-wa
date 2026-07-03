export default {
  name: 'tagall',
  alias: ['everyone'],
  category: 'group',
  description: 'Mention semua member.',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, args }) {
    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const mentions = metadata.participants.map((p) => p.id);
    const text = args.join(' ') || 'Tag all';
    await sock.sendMessage(msg.key.remoteJid, {
      text: `${text}\n\n${mentions.map((jid) => `@${jid.split('@')[0]}`).join('\n')}`,
      mentions
    }, { quoted: msg });
  }
};
