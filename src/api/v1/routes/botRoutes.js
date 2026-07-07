import { Router } from "express";
import { BotController } from "../controllers/BotController.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/authorize.js";
import { validate } from "../../middleware/validate.js";
import {
  createBotValidator,
  botIdValidator,
} from "../validators/botValidator.js";

/**
 * @param {import('../../../manager/BotManager.js').BotManager} botManager
 */
export default function botRoutes(botManager) {
  const router = Router();
  const ctrl = new BotController(botManager);

  router.use(authenticate);

  /**
   * @swagger
   * tags:
   *   name: Bots
   *   description: Bot management
   */

  // GET /bots — requires bot.view permission
  router.get("/", requirePermission("bot.view"), (req, res, next) =>
    ctrl.list(req, res, next),
  );

  // GET /bots/:id — requires bot.view permission
  router.get(
    "/:id",
    requirePermission("bot.view"),
    botIdValidator,
    validate,
    (req, res, next) => ctrl.getById(req, res, next),
  );

  // POST /bots — requires bot.create permission
  router.post(
    "/",
    requirePermission("bot.create"),
    createBotValidator,
    validate,
    (req, res, next) => ctrl.create(req, res, next),
  );

  // DELETE /bots/:id — requires bot.delete permission
  router.delete(
    "/:id",
    requirePermission("bot.delete"),
    botIdValidator,
    validate,
    (req, res, next) => ctrl.remove(req, res, next),
  );

  // POST /bots/:id/pairing-code — requires bot.start permission (sama kayak start, karena ini bagian dari proses konek)
  router.post(
    "/:id/pairing-code",
    requirePermission("bot.start"),
    botIdValidator,
    validate,
    (req, res, next) => ctrl.requestPairingCode(req, res, next),
  );

  // POST /bots/:id/start — requires bot.start permission
  router.post(
    "/:id/start",
    requirePermission("bot.start"),
    botIdValidator,
    validate,
    (req, res, next) => ctrl.start(req, res, next),
  );

  // POST /bots/:id/stop — requires bot.stop permission
  router.post(
    "/:id/stop",
    requirePermission("bot.stop"),
    botIdValidator,
    validate,
    (req, res, next) => ctrl.stop(req, res, next),
  );

  // POST /bots/:id/restart — requires bot.start and bot.stop permissions
  router.post(
    "/:id/restart",
    requirePermission(["bot.start", "bot.stop"]),
    botIdValidator,
    validate,
    (req, res, next) => ctrl.restart(req, res, next),
  );

  // GET /bots/:id/stats — requires bot.view permission
  router.get(
    "/:id/stats",
    requirePermission("bot.view"),
    botIdValidator,
    validate,
    (req, res, next) => ctrl.stats(req, res, next),
  );

  return router;
}
