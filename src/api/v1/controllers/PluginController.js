import { ApiResponse } from '../../response/ApiResponse.js';
import { parsePagination, paginate, applySearch, applySort } from '../../response/paginate.js';

/**
 * PluginController — thin delegate to BotManager plugin operations.
 */
export class PluginController {
  constructor(botManager) {
    this.botManager = botManager;
  }

  /**
   * GET /plugins
   */
  async list(req, res, next) {
    try {
      const { page, limit, sort, order, search } = parsePagination(req.query);
      let plugins = this.botManager.getPlugins();
      if (!Array.isArray(plugins)) plugins = Object.values(plugins);
      plugins = applySearch(plugins, search, ['name', 'description', 'category']);
      plugins = applySort(plugins, sort, order);
      const result = paginate(plugins, { page, limit });
      return ApiResponse.ok(res, result);
    } catch (err) { next(err); }
  }

  /**
   * GET /plugins/:id
   */
  async getById(req, res, next) {
    try {
      const plugin = this.botManager.getPlugin(req.params.id);
      if (!plugin) return ApiResponse.notFound(res, `Plugin "${req.params.id}" tidak ditemukan`);
      return ApiResponse.ok(res, plugin);
    } catch (err) { next(err); }
  }

  /**
   * POST /plugins — Install plugin
   * body: { name, source? }
   */
  async install(req, res, next) {
    try {
      const result = await this.botManager.installPlugin(req.body);
      return ApiResponse.created(res, result, 'Plugin berhasil diinstall');
    } catch (err) { next(err); }
  }

  /**
   * DELETE /plugins/:id
   */
  async remove(req, res, next) {
    try {
      const result = await this.botManager.deletePlugin(req.params.id);
      return ApiResponse.ok(res, result, 'Plugin berhasil dihapus');
    } catch (err) { next(err); }
  }

  /**
   * PATCH /plugins/:id/enable
   */
  async enable(req, res, next) {
    try {
      const result = await this.botManager.enablePlugin(req.params.id, req.query.botId || null);
      return ApiResponse.ok(res, result, 'Plugin berhasil diaktifkan');
    } catch (err) { next(err); }
  }

  /**
   * PATCH /plugins/:id/disable
   */
  async disable(req, res, next) {
    try {
      const result = await this.botManager.disablePlugin(req.params.id, req.query.botId || null);
      return ApiResponse.ok(res, result, 'Plugin berhasil dinonaktifkan');
    } catch (err) { next(err); }
  }

  /**
   * POST /plugins/:id/reload
   */
  async reload(req, res, next) {
    try {
      const result = await this.botManager.reloadPlugin(req.params.id);
      return ApiResponse.ok(res, result, 'Plugin berhasil direload');
    } catch (err) { next(err); }
  }
}
