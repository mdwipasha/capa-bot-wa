import { sendReply } from '../../utils/command.js';

export default {
  name: 'goodbyecard',
  alias: ['gcard'],
  category: 'group',
  description: 'Info goodbye card.',
  groupOnly: true,
  adminOnly: true,
  cooldownMs: 3000,
  async execute({ sock, msg }) {
    await sendReply(sock, msg, 'Goodbye text aktif via .goodbye on. Template kartu visual bisa ditambahkan di service Sharp berikutnya.');
  }
};
