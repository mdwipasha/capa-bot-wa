const toggles = {
  welcome: 'welcome',
  goodbye: 'goodbye',
  antilink: 'antilink',
  antispam: 'antispam',
  antibadword: 'antibadword',
  mute: 'mute',
  autoreact: 'autoreact',
  autoreply: 'autoreply',
  autosticker: 'autosticker',
  autoread: 'autoread',
  autodetectlang: 'autodetectlang',
  antitagall: 'antitagall',
  antibot: 'antibot',
  antifakenumber: 'antifakenumber',
  antidelete: 'antidelete',
  antitoxic: 'antitoxic'
};

export const makeToggle = (name) => ({
  name,
  alias: [],
  category: 'group',
  description: `Mengaktifkan/mematikan ${name}.`,
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, args, db }) {
    const mode = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      await sock.sendMessage(msg.key.remoteJid, { text: `Gunakan: ${name} on/off` }, { quoted: msg });
      return;
    }
    await db.update((store) => {
      store.settings[toggles[name]] ??= {};
      store.settings[toggles[name]][msg.key.remoteJid] = mode === 'on';
    });
    await sock.sendMessage(msg.key.remoteJid, { text: `${name} ${mode === 'on' ? 'aktif' : 'nonaktif'}.` }, { quoted: msg });
  }
});

export default makeToggle('welcome');
