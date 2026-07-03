import { downloadQuotedOrCurrent, getQuotedMessage } from '../../lib/quoted.js';
import { unwrapMessageContent } from '../../lib/message.js';

const mediaPayload = (media, caption) => {
  if (media.type === 'imageMessage') return { image: media.buffer, caption };
  if (media.type === 'videoMessage') return { video: media.buffer, caption };
  if (media.type === 'audioMessage') return { audio: media.buffer, mimetype: media.mime || 'audio/ogg' };
  return {
    document: media.buffer,
    mimetype: media.mime || 'application/octet-stream',
    fileName: `viewonce.${media.ext}`,
    caption
  };
};

export default {
  name: 'readviewonce',
  alias: ['rvo', 'readvo', 'lihatsekali', 'viewonce'],
  category: 'media',
  description: 'Mengirim ulang media sekali lihat sebagai media biasa.',
  async execute({ sock, msg }) {
    const target = getQuotedMessage(msg) || msg;
    const content = unwrapMessageContent(target.message || {});
    const isViewOnce = Boolean(
      target.message?.viewOnceMessage
      || target.message?.viewOnceMessageV2
      || target.message?.viewOnceMessageV2Extension
      || Object.values(content).some((item) => item?.viewOnce)
    );

    if (!isViewOnce) {
      return sock.sendMessage(msg.key.remoteJid, { text: 'Reply media sekali lihat yang ingin dikirim ulang.' }, { quoted: msg });
    }

    const media = await downloadQuotedOrCurrent(msg);
    if (!media) {
      return sock.sendMessage(msg.key.remoteJid, { text: 'Media tidak bisa diambil. Mungkin sudah kedaluwarsa atau tidak tersedia di session bot.' }, { quoted: msg });
    }

    return sock.sendMessage(
      msg.key.remoteJid,
      mediaPayload(media, 'Media sekali lihat berhasil dikirim ulang.'),
      { quoted: msg }
    );
  }
};
