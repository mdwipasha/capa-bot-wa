import { googleLikeSearch } from '../../services/searchService.js';
import { requireText, sendReply } from '../../utils/command.js';

export default {
  name: 'google',
  alias: ['gsearch'],
  category: 'search',
  description: 'Search web ringan via DuckDuckGo.',
  cooldownMs: 6000,
  async execute({ sock, msg, args, prefix }) {
    const query = await requireText(sock, msg, args, `${prefix}google nodejs baileys`);
    if (!query) return;
    const result = await googleLikeSearch(query);
    const related = result.related.map((item, i) => `${i + 1}. ${item.Text}\n${item.FirstURL || ''}`).join('\n\n');
    await sendReply(sock, msg, `*${result.heading}*\n${result.abstract || ''}\n${result.url || ''}\n\n${related || 'Tidak ada hasil ringkas.'}`);
  }
};
