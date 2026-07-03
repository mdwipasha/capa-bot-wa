import { exec } from 'child_process';
import { promisify } from 'util';

const sh = promisify(exec);

export default {
  name: 'terminal',
  alias: ['$', 'cmd'],
  category: 'owner',
  description: 'Menjalankan command terminal.',
  ownerOnly: true,
  cooldownMs: 0,
  async execute({ sock, msg, args }) {
    const command = args.join(' ');
    if (!command) return sock.sendMessage(msg.key.remoteJid, { text: 'Masukkan command terminal.' }, { quoted: msg });
    const { stdout, stderr } = await sh(command, { timeout: 30000, windowsHide: true });
    return sock.sendMessage(msg.key.remoteJid, { text: (stdout || stderr || 'Selesai.').slice(0, 4000) }, { quoted: msg });
  }
};
