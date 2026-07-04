export default {
  name: 'menu',
  alias: ['help'],
  category: 'general',
  description: 'Menampilkan daftar command.',
  async execute({ sock, msg, loader, prefix, config }) {
    const groups = loader.list().reduce((acc, command) => {
      // Exclude owner category from the menu list
      if (command.category?.toLowerCase() === 'owner') return acc;
      
      acc[command.category] ??= [];
      acc[command.category].push(command);
      return acc;
    }, {});
    
    const body = Object.entries(groups).map(([category, commands]) => {
      const names = commands.map((cmd) => `${prefix}${cmd.name}`).sort().join(', ');
      return `*${category.toUpperCase()}*\n${names}`;
    }).join('\n\n');
    
    await sock.sendMessage(msg.key.remoteJid, { text: `*${config.botName} Menu*\nPrefix: ${config.prefixes.join(' ')}\n\n${body}` }, { quoted: msg });
  }
};
