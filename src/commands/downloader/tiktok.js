import { tiktok } from '../../lib/downloader.js';

export default {
  name: 'tiktok',
  alias: ['tt'],
  category: 'downloader',
  description: 'Download video TikTok.',
  async execute({ sock, msg, args }) {
    if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan URL TikTok.' }, { quoted: msg });
    const result = await tiktok(args[0]);
    return sock.sendMessage(msg.key.remoteJid, { video: { url: result.url }, caption: result.title }, { quoted: msg });
  }
};
