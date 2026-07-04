/**
 * HelpGenerator
 * -------------
 * Generate help dan menu otomatis dari metadata command.
 * Tidak perlu menulis manual — semua dibaca dari CommandRegistry.
 *
 * Fitur:
 *   - Menu per kategori (diurutkan)
 *   - Detail satu command (usage, examples, permissions)
 *   - Search results
 *   - Filter by bot (hanya command yang aktif untuk bot tertentu)
 */

/** Urutan kategori default */
const CATEGORY_ORDER = [
  'general', 'owner', 'group', 'ai', 'downloader',
  'search', 'media', 'sticker', 'converter', 'fun',
  'anime', 'ibadah', 'textmaker', 'image', 'other'
];

export class HelpGenerator {
  /**
   * @param {object} options
   * @param {import('./CommandRegistry.js').CommandRegistry} options.registry
   * @param {string} [options.botName] - nama bot
   * @param {string} [options.prefix] - prefix utama untuk tampilan
   */
  constructor({ registry, botName = 'Bot', prefix = '.' } = {}) {
    this.registry = registry;
    this.botName = botName;
    this.prefix = prefix;
  }

  // ─────────────────────────────────────────────
  // Menu Generation
  // ─────────────────────────────────────────────

  /**
   * Generate menu utama (semua kategori, semua command).
   *
   * @param {object} [options]
   * @param {string|null} [options.botId] - filter per bot
   * @param {boolean} [options.showOwner=false] - tampilkan category owner
   * @param {boolean} [options.showHidden=false] - tampilkan command tersembunyi
   * @param {string} [options.prefix] - override prefix
   * @returns {string}
   */
  generateMenu({
    botId = null,
    showOwner = false,
    showHidden = false,
    prefix = null
  } = {}) {
    const px = prefix || this.prefix;
    const commands = this._getActiveCommands(botId);

    // Group by category
    const grouped = this._groupByCategory(commands, { showOwner, showHidden });

    if (!Object.keys(grouped).length) {
      return `*${this.botName}*\n\nTidak ada command aktif.`;
    }

    const sections = CATEGORY_ORDER
      .filter((cat) => grouped[cat])
      .map((cat) => {
        const cmds = grouped[cat];
        const names = cmds
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((cmd) => `${px}${cmd.name}`)
          .join(', ');
        const emoji = this._getCategoryEmoji(cat);
        return `${emoji} *${this._formatCategory(cat)}*\n${names}`;
      });

    // Tambah kategori yang tidak ada di CATEGORY_ORDER
    const extraCats = Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c));
    for (const cat of extraCats) {
      const cmds = grouped[cat];
      const names = cmds.map((cmd) => `${px}${cmd.name}`).sort().join(', ');
      const emoji = this._getCategoryEmoji(cat);
      sections.push(`${emoji} *${this._formatCategory(cat)}*\n${names}`);
    }

    const totalCommands = commands.filter((c) => showHidden || !c.hidden).length;

    return [
      `*${this.botName} Menu*`,
      `Prefix: ${px} | Total: ${totalCommands} command`,
      `Ketik ${px}help <command> untuk detail\n`,
      sections.join('\n\n')
    ].join('\n');
  }

  /**
   * Generate menu untuk satu kategori.
   * @param {string} category
   * @param {object} [options]
   * @returns {string}
   */
  generateCategoryMenu(category, { botId = null, prefix = null } = {}) {
    const px = prefix || this.prefix;
    const cat = category.toLowerCase();
    const commands = this._getActiveCommands(botId)
      .filter((cmd) => cmd.category === cat && !cmd.hidden);

    if (!commands.length) return `Tidak ada command di kategori *${category}*.`;

    const emoji = this._getCategoryEmoji(cat);
    const items = commands
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((cmd) => {
        const aliases = (cmd.aliases || cmd.alias || []).length
          ? ` (alias: ${(cmd.aliases || cmd.alias || []).map((a) => `${px}${a}`).join(', ')})`
          : '';
        return `• ${px}${cmd.name}${aliases}\n  ${cmd.description || 'Tidak ada deskripsi.'}`;
      })
      .join('\n');

    return `${emoji} *${this._formatCategory(cat)}*\n\n${items}`;
  }

  // ─────────────────────────────────────────────
  // Command Detail
  // ─────────────────────────────────────────────

  /**
   * Generate detail help untuk satu command.
   * @param {string} commandName
   * @param {object} [options]
   * @returns {string|null} null jika command tidak ditemukan
   */
  generateCommandHelp(commandName, { prefix = null } = {}) {
    const px = prefix || this.prefix;
    const command = this.registry.get(commandName);
    if (!command) return null;

    const lines = [];

    // Header
    lines.push(`📋 *${px}${command.name}*`);
    if (command.description) lines.push(`📝 ${command.description}`);

    lines.push('');

    // Usage
    if (command.usage) {
      lines.push(`*Usage:*`);
      lines.push(`\`${px}${command.usage}\``);
    }

    // Examples
    const examples = Array.isArray(command.examples) ? command.examples : [];
    if (examples.length) {
      lines.push('');
      lines.push('*Contoh:*');
      for (const ex of examples) {
        lines.push(`\`${px}${ex}\``);
      }
    }

    // Aliases
    const aliases = command.aliases || command.alias || [];
    if (aliases.length) {
      lines.push('');
      lines.push(`*Alias:* ${aliases.map((a) => `${px}${a}`).join(', ')}`);
    }

    // Category
    if (command.category) {
      lines.push(`*Kategori:* ${this._formatCategory(command.category)}`);
    }

    // Cooldown
    if (command.cooldown != null) {
      lines.push(`*Cooldown:* ${command.cooldown} detik`);
    }

    // Restrictions
    const restrictions = [];
    if (command.ownerOnly) restrictions.push('👑 Owner Only');
    if (command.adminOnly) restrictions.push('⚙️ Admin Only');
    if (command.groupOnly) restrictions.push('👥 Group Only');
    if (command.privateOnly) restrictions.push('🔒 Private Only');
    if (command.premiumOnly) restrictions.push('💎 Premium Only');
    if (restrictions.length) {
      lines.push(`*Akses:* ${restrictions.join(' | ')}`);
    }

    // Author & Version
    const meta = [];
    if (command.author && command.author !== 'unknown') meta.push(`Oleh: ${command.author}`);
    if (command.version) meta.push(`v${command.version}`);
    if (meta.length) {
      lines.push('');
      lines.push(meta.join(' | '));
    }

    // Statistics
    const stats = this.registry.getStats(command.name);
    if (stats.total > 0) {
      lines.push(`📊 Digunakan ${stats.total}x | Sukses ${stats.successRate}%`);
    }

    return lines.join('\n');
  }

  // ─────────────────────────────────────────────
  // Search Results
  // ─────────────────────────────────────────────

  /**
   * Generate hasil pencarian command.
   * @param {string} query
   * @param {object} [options]
   * @returns {string}
   */
  generateSearchResults(query, { prefix = null, limit = 10 } = {}) {
    const px = prefix || this.prefix;
    const results = this.registry.search(query).slice(0, limit);

    if (!results.length) {
      return `Tidak ada command yang cocok dengan "*${query}*".`;
    }

    const lines = [`🔍 Hasil pencarian untuk "*${query}*":\n`];
    for (const cmd of results) {
      const emoji = this._getCategoryEmoji(cmd.category);
      lines.push(`${emoji} ${px}${cmd.name} — ${cmd.description || 'Tidak ada deskripsi.'}`);
    }

    return lines.join('\n');
  }

  // ─────────────────────────────────────────────
  // Statistics
  // ─────────────────────────────────────────────

  /**
   * Generate statistik penggunaan command.
   * @param {number} [limit=10]
   * @returns {string}
   */
  generateStats(limit = 10) {
    const top = this.registry.getTopCommands(limit);
    if (!top.length) return 'Belum ada data statistik command.';

    const lines = [`📊 *Top ${limit} Command*\n`];
    top.forEach((stat, i) => {
      const prefix = this.prefix;
      lines.push(
        `${i + 1}. ${prefix}${stat.name} — ${stat.total}x (✅ ${stat.success} / ❌ ${stat.failed})`
      );
    });

    return lines.join('\n');
  }

  // ─────────────────────────────────────────────
  // Internal Helpers
  // ─────────────────────────────────────────────

  /**
   * Ambil semua command yang aktif (enabled, tidak error).
   * @param {string|null} botId
   * @returns {object[]}
   */
  _getActiveCommands(botId = null) {
    const all = botId ? this.registry.allForBot(botId) : this.registry.all();
    return all.filter((cmd) => {
      if (cmd.enabled === false) return false;
      if (cmd.status === 'error') return false;
      if (botId && cmd.enabledForBot === false) return false;
      return true;
    });
  }

  /**
   * Group commands by category.
   * @param {object[]} commands
   * @param {object} options
   * @returns {object}
   */
  _groupByCategory(commands, { showOwner = false, showHidden = false } = {}) {
    const grouped = {};
    for (const cmd of commands) {
      if (!showOwner && cmd.category === 'owner') continue;
      if (!showHidden && cmd.hidden) continue;

      const cat = cmd.category || 'general';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cmd);
    }
    return grouped;
  }

  /**
   * Format category name untuk tampilan.
   * @param {string} category
   * @returns {string}
   */
  _formatCategory(category) {
    const names = {
      general: 'General',
      owner: 'Owner',
      group: 'Group',
      downloader: 'Downloader',
      ai: 'AI',
      fun: 'Fun',
      ibadah: 'Ibadah',
      anime: 'Anime',
      media: 'Media',
      converter: 'Converter',
      search: 'Search',
      sticker: 'Sticker',
      textmaker: 'Text Maker',
      image: 'Image',
      other: 'Other'
    };
    return names[category.toLowerCase()] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  /**
   * Emoji per kategori.
   * @param {string} category
   * @returns {string}
   */
  _getCategoryEmoji(category) {
    const emojis = {
      general: '🌐',
      owner: '👑',
      group: '👥',
      downloader: '⬇️',
      ai: '🤖',
      fun: '🎮',
      ibadah: '🕌',
      anime: '🌸',
      media: '🎬',
      converter: '🔄',
      search: '🔍',
      sticker: '🖼️',
      textmaker: '✏️',
      image: '📷',
      other: '📦'
    };
    return emojis[category.toLowerCase()] || '📁';
  }
}
