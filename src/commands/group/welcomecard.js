import { sendReply } from '../../utils/command.js';

export default {
  name: 'welcomecard',
  alias: ['wcard'],
  category: 'group',
  description: 'Info welcome card.',
  groupOnly: true,
  adminOnly: true,
  cooldownMs: 3000,
  async execute({ sock, msg }) {
    await sendReply(sock, msg, 'Welcome text aktif via .welcome on. Template kartu visual bisa ditambahkan di service Sharp berikutnya.');
  }
};
