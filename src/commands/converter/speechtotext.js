export default {
  name: 'speechtotext',
  alias: ['stt'],
  category: 'converter',
  description: 'Info speech to text.',
  cooldownMs: 3000,
  async execute({ sock, msg }) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Speech to text membutuhkan provider ASR seperti Whisper/OpenAI atau Vosk lokal. Service layer siap ditambahkan tanpa mengubah command lain.' }, { quoted: msg });
  }
};
