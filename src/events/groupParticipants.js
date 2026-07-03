import { db } from '../database/index.js';

export const handleGroupParticipantsUpdate = async ({ sock, update }) => {
  const data = await db.read();
  const jid = update.id;
  const enabledWelcome = data.settings.welcome[jid];
  const enabledGoodbye = data.settings.goodbye[jid];

  for (const participant of update.participants) {
    const mention = `@${participant.split('@')[0]}`;
    if (update.action === 'add' && enabledWelcome) {
      await sock.sendMessage(jid, { text: `Selamat datang ${mention}!`, mentions: [participant] });
    }
    if (update.action === 'remove' && enabledGoodbye) {
      await sock.sendMessage(jid, { text: `${mention} keluar dari grup.`, mentions: [participant] });
    }
  }
};
