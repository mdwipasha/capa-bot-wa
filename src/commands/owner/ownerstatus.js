import os from 'os';

export default {
  name: 'ownerstatus',
  alias: ['botresource'],
  category: 'owner',
  description: 'Melihat memory dan CPU usage.',
  ownerOnly: true,
  cooldownMs: 0,
  async execute({ sock, msg }) {
    const mem = process.memoryUsage();
    await sock.sendMessage(msg.key.remoteJid, {
      text: `Memory RSS: ${Math.round(mem.rss / 1024 / 1024)} MB\nHeap: ${Math.round(mem.heapUsed / 1024 / 1024)} MB\nCPU Load: ${os.loadavg().map((n) => n.toFixed(2)).join(' / ')}`
    }, { quoted: msg });
  }
};
