import { ApiResponse } from '../../response/ApiResponse.js';

/**
 * BroadcastController — thin delegate to BotManager messaging operations.
 */
export class BroadcastController {
  constructor(botManager) {
    this.botManager = botManager;
  }

  /**
   * POST /messages/send
   * body: { sessionId?, phone?, jid?, message }
   */
  async send(req, res, next) {
    try {
      const { sessionId, phone, jid, message } = req.body;
      const result = await this.botManager.sendMessage({ sessionId, phone, jid, message });
      return ApiResponse.ok(res, result, 'Pesan berhasil dikirim');
    } catch (err) { next(err); }
  }

  /**
   * POST /messages/broadcast
   * body: { sessionId?, message, target?, concurrency?, retry?, delayMs?, priority? }
   */
  async broadcast(req, res, next) {
    try {
      const result = await this.botManager.broadcast(req.body);
      return ApiResponse.ok(res, result, 'Broadcast berhasil dijadwalkan');
    } catch (err) { next(err); }
  }

  /**
   * POST /messages/reply
   * body: { sessionId, jid, message, quotedMessageId? }
   */
  async reply(req, res, next) {
    try {
      const { sessionId, jid, message } = req.body;
      const session = this.botManager.requireOnlineSession(sessionId);
      const result = await session.sock.sendMessage(jid, { text: message });
      return ApiResponse.ok(res, result, 'Reply berhasil dikirim');
    } catch (err) { next(err); }
  }
}
