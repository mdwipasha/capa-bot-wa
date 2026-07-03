import axios from 'axios';

export default {
  name: 'randommeme',
  alias: ['memeimg'],
  category: 'fun',
  description: 'Meme random dari meme API.',
  cooldownMs: 5000,
  async execute({ sock, msg }) {
    const { data } = await axios.get('https://meme-api.com/gimme', { timeout: 15000 });
    await sock.sendMessage(msg.key.remoteJid, { image: { url: data.url }, caption: data.title }, { quoted: msg });
  }
};
