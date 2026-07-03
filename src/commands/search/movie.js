import { movieSearch } from '../../services/searchService.js';
import { requireText, sendReply } from '../../utils/command.js';

export default {
  name: 'movie',
  alias: ['film'],
  category: 'search',
  description: 'Mencari film.',
  cooldownMs: 5000,
  async execute({ sock, msg, args, prefix }) {
    const query = await requireText(sock, msg, args, `${prefix}movie inception`);
    if (!query) return;
    const results = await movieSearch(query);
    await sendReply(sock, msg, results.slice(0, 5).map((item) => `*${item.Title}* (${item.Year})\n${item.Type}`).join('\n\n'));
  }
};
