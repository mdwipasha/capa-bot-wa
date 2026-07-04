import { animeQuote } from '../../services/searchService.js';
import { sendReply } from '../../utils/command.js';

export default {
  name: 'animequote',
  alias: ['aniquote'],
  category: 'fun',
  description: 'Quote anime random.',
  cooldownMs: 6000,
  async execute({ sock, msg }) {
    const q = await animeQuote();
    await sendReply(sock, msg, `"${q.quote}"\n- ${q.character || 'Unknown'} (${q.anime || 'Anime'})`);
  }
};
