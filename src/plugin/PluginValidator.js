/**
 * PluginValidator
 * ---------------
 * Bertanggung jawab memvalidasi struktur plugin sebelum di-register.
 * Semua field selain `name` dan `execute` bersifat opsional agar
 * plugin lama tetap kompatibel 100%.
 */

export class PluginValidationError extends Error {
  constructor(message, pluginName = 'unknown') {
    super(message);
    this.name = 'PluginValidationError';
    this.pluginName = pluginName;
    this.code = 'PLUGIN_VALIDATION_ERROR';
  }
}

/** Kategori plugin yang dikenali */
export const VALID_CATEGORIES = new Set([
  'general', 'owner', 'group', 'downloader', 'ai',
  'fun', 'ibadah', 'anime', 'media', 'converter',
  'search', 'sticker', 'textmaker', 'text maker', 'image', 'other'
]);

/** Normalisasi kategori (handle alias dengan spasi) */
const normalizeCategory = (cat) => {
  if (!cat) return 'general';
  const c = String(cat).toLowerCase().trim();
  if (c === 'text maker') return 'textmaker';
  return c;
};


export class PluginValidator {
  /**
   * Validasi satu plugin module.
   * Lempar PluginValidationError jika tidak valid.
   * @param {object} plugin - Plugin module export default
   * @param {object} context - { filePath, existingNames, existingAliases }
   */
  validate(plugin, context = {}) {
    const { filePath = '', existingNames = new Set(), existingAliases = new Map() } = context;

    // — Required: name
    if (!plugin || typeof plugin !== 'object') {
      throw new PluginValidationError('Plugin harus berupa object.', filePath);
    }
    if (!plugin.name || typeof plugin.name !== 'string' || !plugin.name.trim()) {
      throw new PluginValidationError('Plugin harus memiliki property `name` berupa string.', filePath);
    }

    const name = plugin.name.trim().toLowerCase();

    // — Required: execute function
    if (typeof plugin.execute !== 'function') {
      throw new PluginValidationError(
        `Plugin "${name}" harus memiliki method \`execute\` berupa function.`,
        name
      );
    }

    // — Duplicate name check
    if (existingNames.has(name)) {
      throw new PluginValidationError(
        `Plugin dengan nama "${name}" sudah terdaftar. Nama plugin harus unik.`,
        name
      );
    }

    // — Duplicate alias check
    const aliases = Array.isArray(plugin.alias) ? plugin.alias : [];
    for (const alias of aliases) {
      const a = String(alias).toLowerCase();
      if (existingNames.has(a)) {
        throw new PluginValidationError(
          `Alias "${a}" pada plugin "${name}" konflik dengan nama plugin yang sudah ada.`,
          name
        );
      }
      if (existingAliases.has(a) && existingAliases.get(a) !== name) {
        throw new PluginValidationError(
          `Alias "${a}" pada plugin "${name}" sudah digunakan oleh plugin "${existingAliases.get(a)}".`,
          name
        );
      }
    }

    // — Optional field validations (soft — hanya log warning, tidak lempar error)
    const warnings = [];

    if (plugin.version && typeof plugin.version !== 'string') {
      warnings.push('`version` sebaiknya berupa string (contoh: "1.0.0").');
    }
    if (plugin.category && !VALID_CATEGORIES.has(String(plugin.category).toLowerCase())) {
      warnings.push(`Kategori "${plugin.category}" tidak dikenal. Gunakan salah satu dari: ${[...VALID_CATEGORIES].join(', ')}.`);
    }
    if (plugin.permissions && !Array.isArray(plugin.permissions)) {
      warnings.push('`permissions` sebaiknya berupa array.');
    }
    if (plugin.dependencies && !Array.isArray(plugin.dependencies)) {
      warnings.push('`dependencies` sebaiknya berupa array.');
    }
    if (plugin.cooldown !== undefined && (typeof plugin.cooldown !== 'number' || plugin.cooldown < 0)) {
      warnings.push('`cooldown` sebaiknya berupa number >= 0 (dalam detik).');
    }

    return {
      valid: true,
      name,
      warnings,
      normalized: this.normalize(plugin)
    };
  }

  /**
   * Normalisasi plugin: isi default untuk field opsional yang tidak ada.
   * Tidak mengubah field yang sudah ada di plugin asli.
   * @param {object} plugin
   * @returns {object} plugin dengan field lengkap
   */
  normalize(plugin) {
    return {
      // Dari plugin asli (tidak diubah)
      ...plugin,
      // Override dengan nilai yang dinormalisasi
      name: String(plugin.name).trim().toLowerCase(),
      alias: Array.isArray(plugin.alias) ? plugin.alias.map((a) => String(a).toLowerCase()) : [],
      category: normalizeCategory(plugin.category),
      description: plugin.description || '',
      version: plugin.version || '1.0.0',
      author: plugin.author || 'unknown',
      permissions: Array.isArray(plugin.permissions) ? plugin.permissions : [],
      cooldown: typeof plugin.cooldown === 'number' ? plugin.cooldown : null,
      enabled: plugin.enabled !== false, // default true, kecuali eksplisit false
      dependencies: Array.isArray(plugin.dependencies) ? plugin.dependencies : [],
      minBotVersion: plugin.minBotVersion || null
    };
  }

  /**
   * Validasi ringan (tanpa throw) untuk pengecekan cepat.
   * @param {object} plugin
   * @returns {{ valid: boolean, reason?: string }}
   */
  quickCheck(plugin) {
    if (!plugin || typeof plugin !== 'object') return { valid: false, reason: 'Bukan object.' };
    if (!plugin.name || typeof plugin.name !== 'string') return { valid: false, reason: 'Tidak ada name.' };
    if (typeof plugin.execute !== 'function') return { valid: false, reason: 'Tidak ada execute().' };
    return { valid: true };
  }
}
