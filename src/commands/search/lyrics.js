import { lyrics } from '../../services/searchService.js';
import { sendReply } from '../../utils/command.js';

export default {
  name: 'lyrics',
  alias: ['lirik'],
  category: 'search',
  description: 'Mencari lirik. Contoh: lyrics artist | title',
  cooldownMs: 6000,
  async execute({ sock, msg, args, prefix }) {
    const [artist, title] = args.join(' ').split('|').map((item) => item.trim());
    if (!artist || !title) return sendReply(sock, msg, `Contoh: ${prefix}lyrics coldplay | yellow`);
    const text = await lyrics(artist, title);
    await sendReply(sock, msg, text.slice(0, 3500));
  }
};
