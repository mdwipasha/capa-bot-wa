import { configManager, ConfigError, ConfigNotFoundError, ConfigValidationError } from '../../../manager/ConfigManager.js';

/**
 * ConfigController — REST API controller for Configuration Manager.
 * All methods are static and delegate to the singleton configManager.
 */
export class ConfigController {
  /**
   * GET /config — Get all configuration
   */
  static getAll(req, res) {
    try {
      const configs = configManager.getAll();
      res.json({ success: true, data: configs });
    } catch (err) {
      ConfigController._handleError(res, err);
    }
  }

  /**
   * GET /config/categories — Get list of available categories
   */
  static getCategories(req, res) {
    try {
      const categories = configManager.getCategories();
      const schemas = configManager.getSchema();
      res.json({
        success: true,
        data: {
          categories,
          schemas
        }
      });
    } catch (err) {
      ConfigController._handleError(res, err);
    }
  }

  /**
   * GET /config/export — Export all config as JSON
   */
  static exportConfig(req, res) {
    try {
      const exported = configManager.export();
      res.json({
        success: true,
        data: exported,
        exportedAt: new Date().toISOString()
      });
    } catch (err) {
      ConfigController._handleError(res, err);
    }
  }

  /**
   * GET /config/:category — Get config by category
   */
  static getCategory(req, res) {
    try {
      const { category } = req.params;
      const data = configManager.get(category);
      const schema = configManager.getSchema(category);
      res.json({
        success: true,
        data,
        schema
      });
    } catch (err) {
      ConfigController._handleError(res, err);
    }
  }

  /**
   * GET /config/:category/:key — Get single config key
   */
  static getKey(req, res) {
    try {
      const { category, key } = req.params;
      const value = configManager.get(category, key);
      if (value === undefined) {
        return res.status(404).json({
          success: false,
          error: `Key "${key}" not found in category "${category}"`
        });
      }
      res.json({
        success: true,
        data: {
          category,
          key,
          value
        }
      });
    } catch (err) {
      ConfigController._handleError(res, err);
    }
  }

  /**
   * PUT /config/:category — Bulk update category
   */
  static async updateCategory(req, res) {
    try {
      const { category } = req.params;
      const updates = req.body;

      if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          error: 'Request body must be a JSON object with key-value pairs'
        });
      }

      const result = await configManager.update(category, updates);
      res.json({
        success: true,
        message: `Config category "${category}" updated`,
        data: result
      });
    } catch (err) {
      ConfigController._handleError(res, err);
    }
  }

  /**
   * PUT /config/:category/:key — Set single config key
   */
  static async setKey(req, res) {
    try {
      const { category, key } = req.params;
      const { value } = req.body;

      if (value === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Request body must contain a "value" field'
        });
      }

      const result = await configManager.set(category, key, value);
      res.json({
        success: true,
        message: `Config ${category}.${key} updated`,
        data: result
      });
    } catch (err) {
      ConfigController._handleError(res, err);
    }
  }

  /**
   * DELETE /config/:category/:key — Delete single key (reset to default)
   */
  static async deleteKey(req, res) {
    try {
      const { category, key } = req.params;
      const result = await configManager.delete(category, key);
      res.json({
        success: true,
        message: `Config ${category}.${key} deleted (reset to default)`,
        data: result
      });
    } catch (err) {
      ConfigController._handleError(res, err);
    }
  }

  /**
   * POST /config/reset — Reset config to defaults
   */
  static async resetConfig(req, res) {
    try {
      const { category } = req.body || {};
      const result = await configManager.reset(category || undefined);
      res.json({
        success: true,
        message: category
          ? `Config category "${category}" reset to defaults`
          : 'All config reset to defaults',
        data: result
      });
    } catch (err) {
      ConfigController._handleError(res, err);
    }
  }

  /**
   * POST /config/import — Import config from JSON
   */
  static async importConfig(req, res) {
    try {
      const importData = req.body;
      if (!importData || typeof importData !== 'object' || Array.isArray(importData)) {
        return res.status(400).json({
          success: false,
          error: 'Request body must be a JSON object with config categories'
        });
      }

      const result = await configManager.import(importData);
      res.json({
        success: true,
        message: 'Config imported successfully',
        data: result
      });
    } catch (err) {
      ConfigController._handleError(res, err);
    }
  }

  /**
   * Centralized error handler.
   */
  static _handleError(res, err) {
    if (err instanceof ConfigValidationError) {
      return res.status(400).json({
        success: false,
        error: err.message,
        code: err.code
      });
    }
    if (err instanceof ConfigNotFoundError) {
      return res.status(404).json({
        success: false,
        error: err.message,
        code: err.code
      });
    }
    if (err instanceof ConfigError) {
      return res.status(500).json({
        success: false,
        error: err.message,
        code: err.code
      });
    }

    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
}
