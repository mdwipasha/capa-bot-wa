import { ApiResponse } from '../../response/ApiResponse.js';
import { parsePagination, paginate, applySearch, applySort } from '../../response/paginate.js';

/**
 * CommandController — thin delegate to BotManager command operations.
 */
export class CommandController {
  constructor(botManager) {
    this.botManager = botManager;
  }

  /**
   * GET /commands
   */
  async list(req, res, next) {
    try {
      const { page, limit, sort, order, search } = parsePagination(req.query);
      let commands = this.botManager.getCommands();
      if (!Array.isArray(commands)) commands = Object.values(commands);
      commands = applySearch(commands, search, ['name', 'description', 'category']);
      commands = applySort(commands, sort, order);
      const result = paginate(commands, { page, limit });
      return ApiResponse.ok(res, result);
    } catch (err) { next(err); }
  }

  /**
   * GET /commands/:id
   */
  async getById(req, res, next) {
    try {
      const cmd = this.botManager.getCommand(req.params.id);
      if (!cmd) return ApiResponse.notFound(res, `Command "${req.params.id}" tidak ditemukan`);
      return ApiResponse.ok(res, cmd);
    } catch (err) { next(err); }
  }

  /**
   * PATCH /commands/:id/enable
   */
  async enable(req, res, next) {
    try {
      const result = await this.botManager.enableCommand(req.params.id, req.query.botId || null);
      return ApiResponse.ok(res, result, 'Command berhasil diaktifkan');
    } catch (err) { next(err); }
  }

  /**
   * PATCH /commands/:id/disable
   */
  async disable(req, res, next) {
    try {
      const result = await this.botManager.disableCommand(req.params.id, req.query.botId || null);
      return ApiResponse.ok(res, result, 'Command berhasil dinonaktifkan');
    } catch (err) { next(err); }
  }

  /**
   * POST /commands/:id/reload
   */
  async reload(req, res, next) {
    try {
      const result = await this.botManager.reloadCommand(req.params.id);
      return ApiResponse.ok(res, result, 'Command berhasil direload');
    } catch (err) { next(err); }
  }

  /**
   * GET /commands/statistics
   */
  async statistics(req, res, next) {
    try {
      const stats = this.botManager.getStatistics();
      return ApiResponse.ok(res, stats);
    } catch (err) { next(err); }
  }
}
