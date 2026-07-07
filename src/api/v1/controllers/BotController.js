import { ApiResponse } from "../../response/ApiResponse.js";
import {
  parsePagination,
  paginate,
  applySearch,
  applySort,
} from "../../response/paginate.js";

/**
 * BotController — thin delegate to BotManager.
 * No business logic here.
 */
export class BotController {
  constructor(botManager) {
    this.botManager = botManager;
  }

  /**
   * GET /bots
   * @swagger
   * /api/v1/bots:
   *   get:
   *     summary: List all bots
   *     tags: [Bots]
   *     security: [{ BearerAuth: [] }]
   */
  async list(req, res, next) {
    try {
      const { page, limit, sort, order, search } = parsePagination(req.query);
      let bots = this.botManager.getBots();
      bots = applySearch(bots, search, [
        "id",
        "phoneNumber",
        "displayName",
        "status",
      ]);
      bots = applySort(bots, sort, order);
      const result = paginate(bots, { page, limit });
      return ApiResponse.ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /bots/:id
   */
  async getById(req, res, next) {
    try {
      const info = await this.botManager.getBotInfo(req.params.id);
      return ApiResponse.ok(res, info);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /bots
   * body: { phone, authMethod }
   */
  async create(req, res, next) {
    try {
      const bot = await this.botManager.createBot(req.body.phone, {
        authMethod: req.body.authMethod,
      });
      return ApiResponse.created(res, bot, "Bot berhasil dibuat");
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /bots/:id/pairing-code
   */
  async requestPairingCode(req, res, next) {
    try {
      const result = await this.botManager.pairBot(req.params.id);
      return ApiResponse.ok(res, result, "Pairing code diminta");
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /bots/:id
   */
  async remove(req, res, next) {
    try {
      const result = await this.botManager.removeBot(req.params.id);
      return ApiResponse.ok(res, result, "Bot berhasil dihapus");
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /bots/:id/start
   */
  async start(req, res, next) {
    try {
      const bot = await this.botManager.startBot(req.params.id);
      return ApiResponse.ok(res, bot, "Bot berhasil distart");
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /bots/:id/stop
   */
  async stop(req, res, next) {
    try {
      const bot = await this.botManager.stopBot(req.params.id);
      return ApiResponse.ok(res, bot, "Bot berhasil dihentikan");
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /bots/:id/restart
   */
  async restart(req, res, next) {
    try {
      const bot = await this.botManager.restartBot(req.params.id);
      return ApiResponse.ok(res, bot, "Bot berhasil direstart");
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /bots/:id/stats
   */
  async stats(req, res, next) {
    try {
      const stats = this.botManager.getBotStats(req.params.id);
      return ApiResponse.ok(res, stats);
    } catch (err) {
      next(err);
    }
  }
}
