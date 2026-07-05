import { EventEmitter } from 'events';
import { config as envConfig } from '../config/env.js';
import { logger } from '../utils/logger.js';

// ─────────────────────────────────────────────
// Default Configuration Schema
// ─────────────────────────────────────────────

const DEFAULT_CONFIG = {
  system: {
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    autoBackup: false,
    autoRestart: false
  },
  bot: {
    name: 'Capa Bot',
    ownerNumber: '',
    prefix: '.',
    language: 'id',
    timezone: 'Asia/Jakarta',
    autoRead: false,
    typing: false,
    recording: false,
    presence: 'available',
    menuStyle: 'default',
    welcome: true,
    goodbye: true
  },
  ai: {
    defaultProvider: 'gemini',
    fallbackProvider: 'openai',
    temperature: 0.7,
    maxToken: 4096,
    timeout: 30000,
    retry: 2
  },
  downloader: {
    defaultProvider: 'btch',
    maxFileSize: 104857600,
    timeout: 60000,
    retry: 2
  },
  queue: {
    concurrency: 2,
    retry: 3,
    timeout: 30000,
    worker: 2
  },
  plugin: {
    enable: [],
    disable: [],
    priority: {},
    dependencies: {}
  },
  scheduler: {
    timezone: 'Asia/Jakarta',
    maxRetry: 3,
    retryDelay: 5000
  },
  security: {
    cooldownMs: 3000,
    spamWindowMs: 10000,
    spamMaxHits: 8,
    spamBlockHits: 18,
    maxSession: 50,
    jwtSecret: 'secret-wabot-key-123-change-me',
    jwtRefreshSecret: 'refresh-secret-wabot-key-123-change-me',
    jwtExpiresIn: '15m',
    jwtRefreshExpiresIn: '7d',
    apiRateLimitGlobal: 200,
    apiRateLimitAuth: 10,
    apiRateLimitMessage: 60,
    apiRateLimitApiKey: 1000,
    corsOrigins: ['*']
  },
  notification: {
    enabled: false,
    onError: true,
    onRestart: true,
    onBackup: true
  },
  storage: {
    databasePath: 'src/database/database.json',
    sessionBasePath: 'sessions',
    backupPath: 'backups',
    downloadPath: 'downloads'
  }
};

// ─────────────────────────────────────────────
// Schema Metadata (type, description, validation)
// ─────────────────────────────────────────────

const SCHEMA_META = {
  system: {
    maintenanceMode: { type: 'boolean', description: 'Enable/disable maintenance mode' },
    debugMode: { type: 'boolean', description: 'Enable/disable debug mode' },
    logLevel: { type: 'string', description: 'Log level', enum: ['debug', 'info', 'warn', 'error'] },
    autoBackup: { type: 'boolean', description: 'Enable/disable auto backup' },
    autoRestart: { type: 'boolean', description: 'Enable/disable auto restart' }
  },
  bot: {
    name: { type: 'string', description: 'Bot display name' },
    ownerNumber: { type: 'string', description: 'Owner phone number' },
    prefix: { type: 'string', description: 'Command prefix' },
    language: { type: 'string', description: 'Bot language', enum: ['id', 'en'] },
    timezone: { type: 'string', description: 'Timezone' },
    autoRead: { type: 'boolean', description: 'Auto-read incoming messages' },
    typing: { type: 'boolean', description: 'Show typing indicator' },
    recording: { type: 'boolean', description: 'Show recording indicator' },
    presence: { type: 'string', description: 'Presence status', enum: ['available', 'unavailable', 'composing', 'recording'] },
    menuStyle: { type: 'string', description: 'Menu display style', enum: ['default', 'compact', 'detailed'] },
    welcome: { type: 'boolean', description: 'Enable welcome message' },
    goodbye: { type: 'boolean', description: 'Enable goodbye message' }
  },
  ai: {
    defaultProvider: { type: 'string', description: 'Default AI provider' },
    fallbackProvider: { type: 'string', description: 'Fallback AI provider' },
    temperature: { type: 'number', description: 'AI temperature (0-2)', min: 0, max: 2 },
    maxToken: { type: 'number', description: 'Max token per response', min: 1 },
    timeout: { type: 'number', description: 'Request timeout (ms)', min: 1000 },
    retry: { type: 'number', description: 'Max retry count', min: 0 }
  },
  downloader: {
    defaultProvider: { type: 'string', description: 'Default download provider' },
    maxFileSize: { type: 'number', description: 'Max file size in bytes', min: 0 },
    timeout: { type: 'number', description: 'Download timeout (ms)', min: 1000 },
    retry: { type: 'number', description: 'Max retry count', min: 0 }
  },
  queue: {
    concurrency: { type: 'number', description: 'Queue concurrency', min: 1 },
    retry: { type: 'number', description: 'Max retry count', min: 0 },
    timeout: { type: 'number', description: 'Job timeout (ms)', min: 1000 },
    worker: { type: 'number', description: 'Worker count', min: 1 }
  },
  plugin: {
    enable: { type: 'array', description: 'List of explicitly enabled plugins' },
    disable: { type: 'array', description: 'List of disabled plugins' },
    priority: { type: 'object', description: 'Plugin priority map { name: number }' },
    dependencies: { type: 'object', description: 'Plugin dependency map { name: [deps] }' }
  },
  scheduler: {
    timezone: { type: 'string', description: 'Default scheduler timezone' },
    maxRetry: { type: 'number', description: 'Max retry for failed jobs', min: 0 },
    retryDelay: { type: 'number', description: 'Retry delay (ms)', min: 0 }
  },
  security: {
    cooldownMs: { type: 'number', description: 'Command cooldown (ms)', min: 0 },
    spamWindowMs: { type: 'number', description: 'Spam detection window (ms)', min: 0 },
    spamMaxHits: { type: 'number', description: 'Max hits before warning', min: 1 },
    spamBlockHits: { type: 'number', description: 'Max hits before block', min: 1 },
    maxSession: { type: 'number', description: 'Maximum bot sessions', min: 1 },
    jwtSecret: { type: 'string', description: 'JWT signature key' },
    jwtRefreshSecret: { type: 'string', description: 'JWT refresh signature key' },
    jwtExpiresIn: { type: 'string', description: 'JWT expiration' },
    jwtRefreshExpiresIn: { type: 'string', description: 'JWT refresh expiration' },
    apiRateLimitGlobal: { type: 'number', description: 'Global API rate limit', min: 1 },
    apiRateLimitAuth: { type: 'number', description: 'Auth API rate limit', min: 1 },
    apiRateLimitMessage: { type: 'number', description: 'Message API rate limit', min: 1 },
    apiRateLimitApiKey: { type: 'number', description: 'API key rate limit', min: 1 },
    corsOrigins: { type: 'array', description: 'Allowed CORS origins' }
  },
  notification: {
    enabled: { type: 'boolean', description: 'Enable notifications' },
    onError: { type: 'boolean', description: 'Notify on errors' },
    onRestart: { type: 'boolean', description: 'Notify on restarts' },
    onBackup: { type: 'boolean', description: 'Notify on backups' }
  },
  storage: {
    databasePath: { type: 'string', description: 'Database file path' },
    sessionBasePath: { type: 'string', description: 'Session storage path' },
    backupPath: { type: 'string', description: 'Backup storage path' },
    downloadPath: { type: 'string', description: 'Download storage path' }
  }
};

// ─────────────────────────────────────────────
// Cache Entry
// ─────────────────────────────────────────────

class ConfigCache {
  constructor(ttlMs = 300000) {
    this.store = new Map();
    this.ttlMs = ttlMs;
  }

  set(key, value) {
    this.store.set(key, {
      value: structuredClone(value),
      expiresAt: Date.now() + this.ttlMs
    });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return structuredClone(entry.value);
  }

  has(key) {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  invalidate(key) {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  getAll() {
    const result = {};
    for (const [key, entry] of this.store.entries()) {
      if (Date.now() <= entry.expiresAt) {
        result[key] = structuredClone(entry.value);
      } else {
        this.store.delete(key);
      }
    }
    return result;
  }
}

// ─────────────────────────────────────────────
// ConfigManager
// ─────────────────────────────────────────────

export class ConfigManager extends EventEmitter {
  constructor() {
    super();
    this.db = null;
    this.eventBus = null;
    this.logger = logger;
    this.cache = new ConfigCache(300000); // 5 min TTL
    this.watchers = new Set();
    this.initialized = false;
    this.defaults = structuredClone(DEFAULT_CONFIG);
  }

  // ─────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────

  /**
   * Initialize ConfigManager.
   * 1. Read existing config from database
   * 2. Seed from .env if database is empty
   * 3. Populate cache
   * @param {object} database - Database instance
   * @param {object} [eventBus] - EventBus instance for broadcasting changes
   */
  async init(database, eventBus = null) {
    if (this.initialized) return;

    this.db = database;
    this.eventBus = eventBus;

    this.logger.info('[config] Initializing Configuration Manager...');

    // Ensure configs section exists in database
    const data = await this.db.read();
    if (!data.configs) {
      data.configs = {};
      await this.db.write(data);
    }

    // Seed from .env if database configs are empty
    const existingConfigs = data.configs;
    const hasExistingData = Object.keys(existingConfigs).length > 0;

    if (!hasExistingData) {
      this.logger.info('[config] No existing config found. Seeding from .env defaults...');
      const seedData = this._buildSeedFromEnv();
      data.configs = seedData;
      await this.db.write(data);
      this.logger.success('[config] Initial config seeded to database');
    } else {
      // Merge defaults/env values for any missing categories or keys (schema evolution)
      let hasChanges = false;
      const seedData = this._buildSeedFromEnv();
      for (const [category, defaults] of Object.entries(this.defaults)) {
        if (!existingConfigs[category]) {
          existingConfigs[category] = structuredClone(seedData[category] || defaults);
          hasChanges = true;
        } else {
          // Fill missing keys within existing category
          for (const [key, defaultValue] of Object.entries(defaults)) {
            if (existingConfigs[category][key] === undefined) {
              existingConfigs[category][key] = structuredClone(seedData[category]?.[key] ?? defaultValue);
              hasChanges = true;
            }
          }
        }
      }
      if (hasChanges) {
        data.configs = existingConfigs;
        await this.db.write(data);
        this.logger.info('[config] Config schema updated with new defaults and env values');
      }
    }

    // Populate cache from database
    await this._populateCache();

    this.initialized = true;

    const categoryCount = Object.keys(this.defaults).length;
    this.logger.success(`[config] Configuration Manager initialized — ${categoryCount} categories loaded`);
  }

  // ─────────────────────────────────────────────
  // Core Methods
  // ─────────────────────────────────────────────

  /**
   * Get configuration value.
   * @param {string} category - Config category (e.g. 'bot', 'ai')
   * @param {string} [key] - Optional specific key. Omit to get entire category.
   * @param {*} [defaultValue] - Fallback value if key not found
   * @returns {*} Config value
   */
  get(category, key, defaultValue) {
    this._ensureInitialized();

    if (!category) {
      return this.getAll();
    }

    this._validateCategory(category);

    // Try cache first
    let categoryData = this.cache.get(category);
    if (categoryData === undefined) {
      // Cache miss — this should rarely happen due to populateCache
      // Will be resolved on next _populateCache call; return defaults
      categoryData = structuredClone(this.defaults[category] || {});
    }

    if (key === undefined || key === null) {
      return categoryData;
    }

    const value = categoryData[key];
    if (value === undefined) {
      return defaultValue !== undefined ? defaultValue : this.defaults[category]?.[key];
    }
    return value;
  }

  /**
   * Set a single configuration key.
   * @param {string} category - Config category
   * @param {string} key - Config key
   * @param {*} value - New value
   * @returns {Promise<object>} Updated category config
   */
  async set(category, key, value) {
    this._ensureInitialized();
    this._validateCategory(category);
    this._validateValue(category, key, value);

    const oldValue = this.get(category, key);

    // Skip if value hasn't changed
    if (JSON.stringify(oldValue) === JSON.stringify(value)) {
      return this.get(category);
    }

    // Update database
    const data = await this.db.read();
    if (!data.configs[category]) {
      data.configs[category] = structuredClone(this.defaults[category] || {});
    }
    data.configs[category][key] = structuredClone(value);
    await this.db.write(data);

    // Invalidate and repopulate cache for this category
    this.cache.invalidate(category);
    this.cache.set(category, data.configs[category]);

    // Log
    const oldDisplay = typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue);
    const newDisplay = typeof value === 'object' ? JSON.stringify(value) : String(value);
    this.logger.info(`[config] Config ${category}.${key} changed: "${oldDisplay}" → "${newDisplay}"`);

    // Emit events
    const eventPayload = { category, key, oldValue, newValue: value };
    this.emit('config.changed', eventPayload);
    this._broadcastEvent('config.changed', eventPayload);
    this._notifyWatchers('changed', eventPayload);

    return this.get(category);
  }

  /**
   * Bulk update a category.
   * @param {string} category - Config category
   * @param {object} updates - Object with key-value pairs to update
   * @returns {Promise<object>} Updated category config
   */
  async update(category, updates) {
    this._ensureInitialized();
    this._validateCategory(category);

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      throw new ConfigValidationError('Updates must be a plain object');
    }

    // Validate each key
    for (const [key, value] of Object.entries(updates)) {
      this._validateValue(category, key, value);
    }

    // Capture old values for logging
    const oldValues = {};
    const changedKeys = [];
    for (const [key, newValue] of Object.entries(updates)) {
      const oldValue = this.get(category, key);
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        oldValues[key] = oldValue;
        changedKeys.push(key);
      }
    }

    // Skip if nothing changed
    if (changedKeys.length === 0) {
      return this.get(category);
    }

    // Update database
    const data = await this.db.read();
    if (!data.configs[category]) {
      data.configs[category] = structuredClone(this.defaults[category] || {});
    }
    for (const [key, value] of Object.entries(updates)) {
      data.configs[category][key] = structuredClone(value);
    }
    await this.db.write(data);

    // Invalidate and repopulate cache
    this.cache.invalidate(category);
    this.cache.set(category, data.configs[category]);

    // Log
    this.logger.info(`[config] Config ${category} bulk updated: { ${changedKeys.join(', ')} }`);

    // Emit events
    const eventPayload = { category, changes: updates, oldValues, changedKeys };
    this.emit('config.updated', eventPayload);
    this._broadcastEvent('config.updated', eventPayload);
    this._notifyWatchers('updated', eventPayload);

    return this.get(category);
  }

  /**
   * Delete a single configuration key (reset to default).
   * @param {string} category - Config category
   * @param {string} key - Config key to delete
   * @returns {Promise<object>} Updated category config
   */
  async delete(category, key) {
    this._ensureInitialized();
    this._validateCategory(category);

    const data = await this.db.read();
    if (!data.configs[category] || data.configs[category][key] === undefined) {
      throw new ConfigNotFoundError(`Key "${key}" not found in category "${category}"`);
    }

    const oldValue = data.configs[category][key];

    // Reset to default if available, otherwise remove
    if (this.defaults[category]?.[key] !== undefined) {
      data.configs[category][key] = structuredClone(this.defaults[category][key]);
    } else {
      delete data.configs[category][key];
    }
    await this.db.write(data);

    // Update cache
    this.cache.invalidate(category);
    this.cache.set(category, data.configs[category]);

    // Log
    this.logger.info(`[config] Config ${category}.${key} deleted (reset to default)`);

    // Emit events
    const eventPayload = { category, key, oldValue };
    this.emit('config.deleted', eventPayload);
    this._broadcastEvent('config.deleted', eventPayload);
    this._notifyWatchers('deleted', eventPayload);

    return this.get(category);
  }

  /**
   * Reset category (or all categories) to defaults.
   * @param {string} [category] - Specific category to reset. Omit to reset all.
   * @returns {Promise<object>} Reset config
   */
  async reset(category) {
    this._ensureInitialized();

    const data = await this.db.read();

    if (category) {
      this._validateCategory(category);
      data.configs[category] = structuredClone(this.defaults[category]);
      this.cache.invalidate(category);
      this.cache.set(category, data.configs[category]);
      this.logger.info(`[config] Config category "${category}" reset to defaults`);
    } else {
      data.configs = structuredClone(this.defaults);
      // Re-seed env values on full reset
      const seedData = this._buildSeedFromEnv();
      for (const [cat, values] of Object.entries(seedData)) {
        for (const [key, value] of Object.entries(values)) {
          data.configs[cat][key] = value;
        }
      }
      this.cache.invalidate();
      for (const [cat, values] of Object.entries(data.configs)) {
        this.cache.set(cat, values);
      }
      this.logger.info('[config] All config categories reset to defaults');
    }

    await this.db.write(data);

    // Emit events
    const eventPayload = { category: category || 'all' };
    this.emit('config.reset', eventPayload);
    this._broadcastEvent('config.reset', eventPayload);
    this._notifyWatchers('reset', eventPayload);

    return category ? this.get(category) : this.getAll();
  }

  /**
   * Import configuration from a JSON object.
   * @param {object} importData - Full or partial config object
   * @returns {Promise<object>} Imported config
   */
  async import(importData) {
    this._ensureInitialized();

    if (!importData || typeof importData !== 'object' || Array.isArray(importData)) {
      throw new ConfigValidationError('Import data must be a plain object');
    }

    const validCategories = Object.keys(this.defaults);
    const importedCategories = [];

    const data = await this.db.read();
    if (!data.configs) data.configs = {};

    for (const [category, values] of Object.entries(importData)) {
      if (!validCategories.includes(category)) {
        this.logger.warn(`[config] Import skipped unknown category: "${category}"`);
        continue;
      }

      if (!values || typeof values !== 'object' || Array.isArray(values)) {
        this.logger.warn(`[config] Import skipped invalid data for category: "${category}"`);
        continue;
      }

      // Merge with defaults first to ensure completeness
      data.configs[category] = {
        ...structuredClone(this.defaults[category]),
        ...structuredClone(values)
      };
      importedCategories.push(category);
    }

    await this.db.write(data);

    // Repopulate entire cache
    await this._populateCache();

    this.logger.success(`[config] Config imported — categories: ${importedCategories.join(', ')}`);

    // Emit events
    const eventPayload = { categories: importedCategories };
    this.emit('config.imported', eventPayload);
    this._broadcastEvent('config.imported', eventPayload);
    this._notifyWatchers('imported', eventPayload);

    return this.getAll();
  }

  /**
   * Export all configuration as a JSON object.
   * @returns {object} Full config export
   */
  export() {
    this._ensureInitialized();
    return this.getAll();
  }

  // ─────────────────────────────────────────────
  // Accessors
  // ─────────────────────────────────────────────

  /**
   * Get all configuration from cache.
   * @returns {object} All config categories
   */
  getAll() {
    this._ensureInitialized();
    const all = this.cache.getAll();

    // Ensure all default categories are represented
    for (const [category, defaults] of Object.entries(this.defaults)) {
      if (!all[category]) {
        all[category] = structuredClone(defaults);
      }
    }

    return all;
  }

  /**
   * Get list of available categories.
   * @returns {string[]}
   */
  getCategories() {
    return Object.keys(this.defaults);
  }

  /**
   * Get schema metadata for a category.
   * @param {string} [category] - Category name. Omit for all schemas.
   * @returns {object} Schema metadata
   */
  getSchema(category) {
    if (category) {
      this._validateCategory(category);
      return {
        category,
        fields: SCHEMA_META[category] || {},
        defaults: structuredClone(this.defaults[category] || {})
      };
    }
    return Object.entries(SCHEMA_META).map(([cat, fields]) => ({
      category: cat,
      fields,
      defaults: structuredClone(this.defaults[cat] || {})
    }));
  }

  // ─────────────────────────────────────────────
  // Watcher System
  // ─────────────────────────────────────────────

  /**
   * Register a watcher callback for config changes.
   * Callback signature: (type, payload) => void
   * @param {Function} callback
   */
  onChange(callback) {
    if (typeof callback !== 'function') return;
    this.watchers.add(callback);
  }

  /**
   * Unregister a watcher callback.
   * @param {Function} callback
   */
  offChange(callback) {
    this.watchers.delete(callback);
  }

  // ─────────────────────────────────────────────
  // Internal Helpers
  // ─────────────────────────────────────────────

  /**
   * Build initial seed data by merging .env values into default config.
   */
  _buildSeedFromEnv() {
    const seed = structuredClone(this.defaults);

    // Map .env values → config categories
    // Bot
    if (envConfig.botName) seed.bot.name = envConfig.botName;
    if (envConfig.ownerNumber) seed.bot.ownerNumber = envConfig.ownerNumber;
    if (envConfig.prefixes?.[0]) seed.bot.prefix = envConfig.prefixes[0];

    // Security
    if (envConfig.cooldownMs) seed.security.cooldownMs = envConfig.cooldownMs;
    if (envConfig.spamWindowMs) seed.security.spamWindowMs = envConfig.spamWindowMs;
    if (envConfig.spamMaxHits) seed.security.spamMaxHits = envConfig.spamMaxHits;
    if (envConfig.spamBlockHits) seed.security.spamBlockHits = envConfig.spamBlockHits;
    if (envConfig.maxSession) seed.security.maxSession = envConfig.maxSession;
    if (envConfig.jwtSecret) seed.security.jwtSecret = envConfig.jwtSecret;
    if (envConfig.jwtRefreshSecret) seed.security.jwtRefreshSecret = envConfig.jwtRefreshSecret;
    if (envConfig.jwtExpiresIn) seed.security.jwtExpiresIn = envConfig.jwtExpiresIn;
    if (envConfig.jwtRefreshExpiresIn) seed.security.jwtRefreshExpiresIn = envConfig.jwtRefreshExpiresIn;
    if (envConfig.apiRateLimitGlobal) seed.security.apiRateLimitGlobal = envConfig.apiRateLimitGlobal;
    if (envConfig.apiRateLimitAuth) seed.security.apiRateLimitAuth = envConfig.apiRateLimitAuth;
    if (envConfig.apiRateLimitMessage) seed.security.apiRateLimitMessage = envConfig.apiRateLimitMessage;
    if (envConfig.apiRateLimitApiKey) seed.security.apiRateLimitApiKey = envConfig.apiRateLimitApiKey;
    if (envConfig.corsOrigins) seed.security.corsOrigins = envConfig.corsOrigins;

    // Storage
    if (envConfig.databasePath) seed.storage.databasePath = envConfig.databasePath;
    if (envConfig.sessionBasePath) seed.storage.sessionBasePath = envConfig.sessionBasePath;

    return seed;
  }

  /**
   * Populate cache from database.
   */
  async _populateCache() {
    const data = await this.db.read();
    const configs = data.configs || {};

    for (const [category, defaults] of Object.entries(this.defaults)) {
      const merged = { ...structuredClone(defaults), ...(configs[category] || {}) };
      this.cache.set(category, merged);
    }
  }

  /**
   * Validate category name exists.
   */
  _validateCategory(category) {
    if (!this.defaults[category]) {
      throw new ConfigNotFoundError(`Unknown config category: "${category}". Available: ${Object.keys(this.defaults).join(', ')}`);
    }
  }

  /**
   * Validate a value against schema metadata.
   */
  _validateValue(category, key, value) {
    const meta = SCHEMA_META[category]?.[key];
    if (!meta) return; // Unknown keys are allowed (extensible)

    if (meta.type === 'boolean' && typeof value !== 'boolean') {
      throw new ConfigValidationError(`Config ${category}.${key} must be a boolean`);
    }
    if (meta.type === 'number') {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new ConfigValidationError(`Config ${category}.${key} must be a number`);
      }
      if (meta.min !== undefined && value < meta.min) {
        throw new ConfigValidationError(`Config ${category}.${key} must be >= ${meta.min}`);
      }
      if (meta.max !== undefined && value > meta.max) {
        throw new ConfigValidationError(`Config ${category}.${key} must be <= ${meta.max}`);
      }
    }
    if (meta.type === 'string' && typeof value !== 'string') {
      throw new ConfigValidationError(`Config ${category}.${key} must be a string`);
    }
    if (meta.type === 'array' && !Array.isArray(value)) {
      throw new ConfigValidationError(`Config ${category}.${key} must be an array`);
    }
    if (meta.type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
      throw new ConfigValidationError(`Config ${category}.${key} must be an object`);
    }
    if (meta.enum && meta.type === 'string' && !meta.enum.includes(value)) {
      throw new ConfigValidationError(`Config ${category}.${key} must be one of: ${meta.enum.join(', ')}`);
    }
  }

  /**
   * Ensure ConfigManager is initialized before operations.
   */
  _ensureInitialized() {
    if (!this.initialized) {
      throw new ConfigError('ConfigManager is not initialized. Call init() first.');
    }
  }

  /**
   * Broadcast event via EventBus (if available).
   */
  _broadcastEvent(event, payload) {
    if (this.eventBus) {
      this.eventBus.emitEvent(event, payload);
    }
  }

  /**
   * Notify all registered watchers.
   */
  _notifyWatchers(type, payload) {
    for (const callback of this.watchers) {
      try {
        callback(type, payload);
      } catch (err) {
        this.logger.error(`[config] Watcher callback error: ${err.message}`);
      }
    }
  }
}

// ─────────────────────────────────────────────
// Error Classes
// ─────────────────────────────────────────────

export class ConfigError extends Error {
  constructor(message, code = 'CONFIG_ERROR') {
    super(message);
    this.name = 'ConfigError';
    this.code = code;
  }
}

export class ConfigNotFoundError extends ConfigError {
  constructor(message) {
    super(message, 'CONFIG_NOT_FOUND');
    this.name = 'ConfigNotFoundError';
  }
}

export class ConfigValidationError extends ConfigError {
  constructor(message) {
    super(message, 'CONFIG_VALIDATION_ERROR');
    this.name = 'ConfigValidationError';
  }
}

// ─────────────────────────────────────────────
// Singleton Export
// ─────────────────────────────────────────────

export const configManager = new ConfigManager();
