import os from 'os';
import process from 'process';
import { ApiResponse } from '../../response/ApiResponse.js';
import { UserModel } from '../../../models/UserModel.js';

/**
 * SystemController — system info, health, logs, statistics.
 */
export class SystemController {
  constructor(botManager) {
    this.botManager = botManager;
  }

  /**
   * GET /system — General system overview
   */
  async overview(req, res, next) {
    try {
      const bots = this.botManager.getBots();
      const stats = await this.botManager.getSystemStats();
      const mem = process.memoryUsage();
      const cpus = os.cpus();

      return ApiResponse.ok(res, {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        pid: process.pid,
        memory: {
          rss: Math.round(mem.rss / 1024 / 1024),
          heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
          external: Math.round(mem.external / 1024 / 1024),
          unit: 'MB'
        },
        cpu: {
          model: cpus[0]?.model || 'Unknown',
          cores: cpus.length,
          loadAvg: os.loadavg(),
          speed: cpus[0]?.speed || 0
        },
        os: {
          hostname: os.hostname(),
          type: os.type(),
          release: os.release(),
          totalMemory: Math.round(os.totalmem() / 1024 / 1024),
          freeMemory: Math.round(os.freemem() / 1024 / 1024)
        },
        bots: {
          total: bots.length,
          online: bots.filter((b) => b.connected).length,
          offline: bots.filter((b) => !b.connected).length
        },
        stats
      });
    } catch (err) { next(err); }
  }

  /**
   * GET /system/health — Health check (public)
   */
  async health(req, res, next) {
    try {
      const bots = this.botManager.getBots();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const cpuLoad = os.loadavg()[0];

      const isHealthy = cpuLoad < 10 && (freeMem / totalMem) > 0.1;

      const payload = {
        status: isHealthy ? 'healthy' : 'degraded',
        version: process.version,
        uptime: process.uptime(),
        memory: {
          used: Math.round((totalMem - freeMem) / 1024 / 1024),
          total: Math.round(totalMem / 1024 / 1024),
          percentage: Math.round(((totalMem - freeMem) / totalMem) * 100),
          unit: 'MB'
        },
        cpu: {
          loadAvg1m: parseFloat(cpuLoad.toFixed(2)),
          cores: os.cpus().length
        },
        bots: {
          online: bots.filter((b) => b.connected).length,
          total: bots.length
        },
        queues: this.botManager.queueManager.getStats(),
        timestamp: new Date().toISOString()
      };

      return res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        message: isHealthy ? 'Service sehat' : 'Service degraded',
        code: isHealthy ? 200 : 503,
        data: payload,
        error: null,
        timestamp: payload.timestamp,
        requestId: res.locals?.requestId
      });
    } catch (err) { next(err); }
  }

  /**
   * GET /system/statistics
   */
  async statistics(req, res, next) {
    try {
      const sysStats = await this.botManager.getSystemStats();
      const cmdStats = this.botManager.getStatistics();
      const queueStats = this.botManager.queueManager.getStats();

      return ApiResponse.ok(res, {
        system: sysStats,
        commands: cmdStats,
        queues: queueStats,
        timestamp: new Date().toISOString()
      });
    } catch (err) { next(err); }
  }

  /**
   * GET /system/logs — Retrieve audit logs
   */
  async logs(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
      const result = await UserModel.getAuditLogs({ page, limit });
      return ApiResponse.ok(res, result);
    } catch (err) { next(err); }
  }
}
