import { ApiResponse } from "../../response/ApiResponse.js";
import {
  parsePagination,
  paginate,
  applySearch,
} from "../../response/paginate.js";

/**
 * SessionController — thin delegate to BotManager session operations.
 */
export class SessionController {
  constructor(botManager) {
    this.botManager = botManager;
  }

  /**
   * GET /sessions
   */
  async list(req, res, next) {
    try {
      const { page, limit, search } = parsePagination(req.query);
      let sessions = this.botManager.getBots();
      sessions = applySearch(sessions, search, [
        "id",
        "phoneNumber",
        "status",
        "displayName",
      ]);
      const result = paginate(sessions, { page, limit });
      return ApiResponse.ok(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /sessions
   * body: { phone }
   */
  async create(req, res, next) {
    try {
      const session = await this.botManager.createBot(req.body.phone, {
        authMethod: req.body.authMethod,
      });
      return ApiResponse.created(res, session, "Session berhasil dibuat");
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /sessions/:id/pairing-code
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
   * DELETE /sessions/:id
   */
  async remove(req, res, next) {
    try {
      const result = await this.botManager.removeBot(req.params.id);
      return ApiResponse.ok(res, result, "Session berhasil dihapus");
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /sessions/:id/reconnect
   */
  async reconnect(req, res, next) {
    try {
      const session = await this.botManager.startBot(req.params.id);
      return ApiResponse.ok(res, session, "Session berhasil direconnect");
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /sessions/:id/disconnect
   */
  async disconnect(req, res, next) {
    try {
      const session = await this.botManager.stopBot(req.params.id);
      return ApiResponse.ok(res, session, "Session berhasil didisconnect");
    } catch (err) {
      next(err);
    }
  }
}
