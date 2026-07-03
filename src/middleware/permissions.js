import { config } from '../config/env.js';
import { groupAdminVariants, isGroupJid, senderNumber, senderVariants } from '../lib/message.js';

export const checkPermissions = async ({ sock, msg, command }) => {
  const from = msg.key.remoteJid;
  const number = senderNumber(msg);
  const isGroup = isGroupJid(from);
  const isOwner = number === config.ownerNumber;

  if (command.ownerOnly && !isOwner) return 'Command ini khusus owner.';
  if (command.groupOnly && !isGroup) return 'Command ini hanya bisa digunakan di grup.';
  if (command.privateOnly && isGroup) return 'Command ini hanya bisa digunakan di private chat.';

  if (command.adminOnly) {
    if (!isGroup) return 'Command ini hanya untuk admin grup.';
    const admins = await groupAdminVariants(sock, from);
    const senderIds = senderVariants(msg);
    const senderIsAdmin = [...senderIds].some((id) => admins.has(id));
    if (!senderIsAdmin && !isOwner) return 'Command ini hanya untuk admin grup.';
  }

  return null;
};
