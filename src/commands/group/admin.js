import { mentionedJids } from '../../utils/text.js';

const actionMap = { promote: 'promote', demote: 'demote', kick: 'remove', add: 'add' };

const makeAdminAction = (name) => ({
  name,
  alias: [],
  category: 'group',
  description: `${name} member grup.`,
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, args }) {
    const targets = mentionedJids(msg);
    if (name === 'add' && args[0]) targets.push(`${args[0].replace(/\D/g, '')}@s.whatsapp.net`);
    if (!targets.length) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Mention target atau masukkan nomor.' }, { quoted: msg });
      return;
    }
    await sock.groupParticipantsUpdate(msg.key.remoteJid, targets, actionMap[name]);
    await sock.sendMessage(msg.key.remoteJid, { text: `${name} berhasil.` }, { quoted: msg });
  }
});

export default makeAdminAction('promote');
export { makeAdminAction };
