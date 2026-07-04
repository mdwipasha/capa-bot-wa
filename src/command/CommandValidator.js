/**
 * CommandValidator
 * ----------------
 * Validasi dan normalisasi metadata command secara lengkap.
 * Semua field selain `name` dan `execute` bersifat opsional
 * sehingga command lama tetap kompatibel 100%.
 *
 * Perbedaan dari PluginValidator:
 * - Support metadata lebih lengkap (usage, examples, ownerOnly, adminOnly, dll.)
 * - Normalisasi semua field permission flags
 * - Validasi category dari daftar resmi
 */

/** Kategori command yang dikenali */
export const VALID_CATEGORIES = new Set([
  'general', 'owner', 'group', 'downloader', 'ai',
  'fun', 'ibadah', 'anime', 'media', 'converter',
  'search', 'sticker', 'textmaker', 'text maker', 'image', 'other'
]);

/** Normalisasi kategori */
const normalizeCategory = (cat) => {
  if (!cat) return 'general';
  const c = String(cat).toLowerCase().trim();
  if (c === 'text maker') return 'textmaker';
  return VALID_CATEGORIES.has(c) ? c : 'general';
};

export class CommandValidationError extends Error {
  constructor(message, commandName = 'unknown') {
    super(message);
    this.name = 'CommandValidationError';
    this.commandName = commandName;
    this.code = 'COMMAND_VALIDATION_ERROR';
  }
}

export class CommandValidator {
  /**
   * Validasi command module. Lempar CommandValidationError jika tidak valid.
   * @param {object} command - Command module export default
   * @param {object} context - { filePath, existingNames, existingAliases }
   * @returns {{ valid: true, name: string, warnings: string[], normalized: object }}
   */
  validate(command, context = {}) {
    const { filePath = '', existingNames = new Set(), existingAliases = new Map() } = context;

    // — Required: harus object
    if (!command || typeof command !== 'object') {
      throw new CommandValidationError('Command harus berupa object.', filePath);
    }

    // — Required: name
    if (!command.name || typeof command.name !== 'string' || !command.name.trim()) {
      throw new CommandValidationError(
        'Command harus memiliki property `name` berupa string.',
        filePath
      );
    }

    const name = command.name.trim().toLowerCase();

    // — Required: execute
    if (typeof command.execute !== 'function') {
      throw new CommandValidationError(
        `Command "${name}" harus memiliki method \`execute\` berupa function.`,
        name
      );
    }

    // — Duplicate name check
    if (existingNames.has(name)) {
      throw new CommandValidationError(
        `Command dengan nama "${name}" sudah terdaftar. Nama command harus unik.`,
        name
      );
    }

    // — Alias check
    const aliases = Array.isArray(command.alias) ? command.alias : (command.aliases || []);
    for (const alias of aliases) {
      const a = String(alias).toLowerCase().trim();
      if (existingNames.has(a)) {
        throw new CommandValidationError(
          `Alias "${a}" pada command "${name}" konflik dengan nama command yang sudah ada.`,
          name
        );
      }
      if (existingAliases.has(a) && existingAliases.get(a) !== name) {
        throw new CommandValidationError(
          `Alias "${a}" pada command "${name}" sudah digunakan oleh command "${existingAliases.get(a)}".`,
          name
        );
      }
    }

    // — Soft warnings
    const warnings = [];
    if (command.version && typeof command.version !== 'string') {
      warnings.push('`version` sebaiknya berupa string (contoh: "1.0.0").');
    }
    if (command.cooldown !== undefined && (typeof command.cooldown !== 'number' || command.cooldown < 0)) {
      warnings.push('`cooldown` sebaiknya berupa number >= 0 (dalam detik).');
    }
    if (command.permissions && !Array.isArray(command.permissions)) {
      warnings.push('`permissions` sebaiknya berupa array.');
    }

    return {
      valid: true,
      name,
      warnings,
      normalized: this.normalize(command)
    };
  }

  /**
   * Normalisasi command: isi default untuk semua field yang tidak ada.
   * @param {object} command
   * @returns {object}
   */
  normalize(command) {
    const name = String(command.name).trim().toLowerCase();

    // Support alias atau aliases (backward compat)
    const rawAliases = Array.isArray(command.alias)
      ? command.alias
      : Array.isArray(command.aliases)
        ? command.aliases
        : [];

    return {
      // Semua field asli tetap dipertahankan
      ...command,

      // Metadata wajib
      name,
      aliases: rawAliases.map((a) => String(a).toLowerCase().trim()),
      alias: rawAliases.map((a) => String(a).toLowerCase().trim()), // backward compat

      // Info command
      description: command.description || '',
      usage: command.usage || `${name}`,
      examples: Array.isArray(command.examples) ? command.examples : [],
      category: normalizeCategory(command.category),
      version: command.version || '1.0.0',
      author: command.author || 'unknown',
      hidden: command.hidden === true,

      // Permission flags
      enabled: command.enabled !== false,
      ownerOnly: command.ownerOnly === true,
      adminOnly: command.adminOnly === true,
      groupOnly: command.groupOnly === true,
      privateOnly: command.privateOnly === true,
      premiumOnly: command.premiumOnly === true,
      permissions: Array.isArray(command.permissions) ? command.permissions : [],

      // Cooldown (detik)
      cooldown: typeof command.cooldown === 'number' && command.cooldown >= 0
        ? command.cooldown
        : null,

      // Dependencies
      dependencies: Array.isArray(command.dependencies) ? command.dependencies : [],
      minBotVersion: command.minBotVersion || null,

      // Tags
      tags: Array.isArray(command.tags) ? command.tags : []
    };
  }

  /**
   * Validasi ringan (tanpa throw) untuk pengecekan cepat.
   * @param {object} command
   * @returns {{ valid: boolean, reason?: string }}
   */
  quickCheck(command) {
    if (!command || typeof command !== 'object') return { valid: false, reason: 'Bukan object.' };
    if (!command.name || typeof command.name !== 'string') return { valid: false, reason: 'Tidak ada name.' };
    if (typeof command.execute !== 'function') return { valid: false, reason: 'Tidak ada execute().' };
    return { valid: true };
  }
}
