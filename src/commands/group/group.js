export default {
  name: 'group',
  alias: ['gc'],
  category: 'group',
  description: 'Buka/tutup grup.',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, args }) {
    const mode = args[0]?.toLowerCase();
    if (!['open', 'close'].includes(mode)) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Gunakan: group open/close' }, { quoted: msg });
      return;
    }
    await sock.groupSettingUpdate(msg.key.remoteJid, mode === 'open' ? 'not_announcement' : 'announcement');
    await sock.sendMessage(msg.key.remoteJid, { text: `Grup berhasil di-${mode}.` }, { quoted: msg });
  }
};
