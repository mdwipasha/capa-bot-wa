import { db } from '../database/index.js';
import { jidNumber } from '../lib/message.js';

const participantJid = (participant) => {
  if (typeof participant === 'string') return participant;
  return participant?.id || participant?.phoneNumber || participant?.lid || '';
};

export const handleGroupParticipantsUpdate = async ({ sock, update }) => {
  const data = await db.read();
  const jid = update.id;
  const enabledWelcome = data.settings.welcome?.[jid];
  const enabledGoodbye = data.settings.goodbye?.[jid];

  for (const participant of update.participants || []) {
    const userJid = participantJid(participant);
    if (!userJid) continue;
    const mention = `@${jidNumber(userJid)}`;
    if (update.action === 'add' && enabledWelcome) {
      await sock.sendMessage(jid, { text: `Selamat datang ${mention}!`, mentions: [userJid] });
    }
    if (update.action === 'remove' && enabledGoodbye) {
      await sock.sendMessage(jid, { text: `${mention} keluar dari grup.`, mentions: [userJid] });
    }
  }
};
