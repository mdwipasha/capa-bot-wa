import { currencyRate } from '../../services/searchService.js';
import { sendReply } from '../../utils/command.js';

export default {
  name: 'currency',
  alias: ['kurs'],
  category: 'search',
  description: 'Cek kurs mata uang. Contoh: currency USD IDR 10.',
  cooldownMs: 5000,
  async execute({ sock, msg, args, prefix }) {
    const [from, to, amountRaw = '1'] = args;
    if (!from || !to) return sendReply(sock, msg, `Contoh: ${prefix}currency USD IDR 10`);
    const rate = await currencyRate(from, to);
    const amount = Number(amountRaw) || 1;
    await sendReply(sock, msg, `${amount} ${from.toUpperCase()} = ${(amount * rate).toLocaleString('id-ID')} ${to.toUpperCase()}`);
  }
};
