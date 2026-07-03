import { formatDuration } from '../../utils/time.js';

export default {
  name: 'runtime',
  alias: ['uptime'],
  category: 'general',
  description: 'Menampilkan runtime bot.',
  async execute({ sock, msg }) {
    await sock.sendMessage(msg.key.remoteJid, { text: `Runtime: ${formatDuration(process.uptime() * 1000)}` }, { quoted: msg });
  }
};
