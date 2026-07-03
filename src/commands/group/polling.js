import { senderNumber } from '../../lib/message.js';
import { sendReply } from '../../utils/command.js';

export default {
  name: 'polling',
  alias: ['pilihvote'],
  category: 'group',
  description: 'Memilih vote aktif. Contoh: polling 1',
  groupOnly: true,
  cooldownMs: 2000,
  async execute({ sock, msg, args, db }) {
    const index = Number(args[0]) - 1;
    const data = await db.read();
    const vote = data.votes?.[msg.key.remoteJid];
    if (!vote) return sendReply(sock, msg, 'Tidak ada vote aktif.');
    if (!vote.options[index]) return sendReply(sock, msg, 'Nomor opsi tidak valid.');
    await db.update((store) => { store.votes[msg.key.remoteJid].votes[senderNumber(msg)] = index; });
    const fresh = (await db.read()).votes[msg.key.remoteJid];
    const counts = fresh.options.map((_, i) => Object.values(fresh.votes).filter((v) => v === i).length);
    await sendReply(sock, msg, `Hasil sementara:\n${fresh.options.map((opt, i) => `${i + 1}. ${opt}: ${counts[i]}`).join('\n')}`);
  }
};
