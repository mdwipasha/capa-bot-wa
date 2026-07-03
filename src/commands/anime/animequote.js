import { animeQuote } from '../../services/searchService.js';
import { sendReply } from '../../utils/command.js';

export default {
  name: 'animequote',
  alias: ['aniquote'],
  category: 'anime',
  description: 'Quote anime random.',
  cooldownMs: 6000,
  async execute({ sock, msg }) {
    const q = await animeQuote();
    await sendReply(sock, msg, `"${q.content || q.quote}"\n- ${q.character?.name || q.character || 'Unknown'} (${q.anime?.name || q.anime || 'Anime'})`);
  }
};
