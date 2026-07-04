import fs from 'fs-extra';
import { config } from '../../config/env.js';

export default {
  name: 'clearsession',
  alias: ['clear-session'],
  category: 'owner',
  description: 'Menghapus session Baileys.',
  ownerOnly: true,
  async execute({ sock, msg, session }) {
    await fs.emptyDir(session?.sessionPath || config.sessionPath);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Session dibersihkan. Restart bot untuk login ulang.' }, { quoted: msg });
  }
};
