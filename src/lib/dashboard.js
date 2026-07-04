import express from 'express';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import QRCode from 'qrcode';
import { config } from '../config/env.js';
import { db } from '../database/index.js';
import { activityLogs, logger } from '../utils/logger.js';
import { formatDuration } from '../utils/time.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../../public');

const asyncRoute = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    const status = error.code === 'BOT_NOT_FOUND'
      ? 404
      : ['BOT_OFFLINE', 'SESSION_EXPIRED'].includes(error.code)
        ? 409
        : 400;
    res.status(status).json({ ok: false, code: error.code || 'ERROR', error: error.message });
  }
};

export const startDashboard = ({ botState, botManager, restart }) => {
  const app = express();
  app.use(express.json());
  app.use(express.static(publicDir));

  app.get('/api/status', async (_, res) => {
    const data = await db.read();
    const sessions = botManager ? botManager.getBots() : [];
    const primaryBot = sessions[0] || null;
    const primaryState = botState || {
      isConnected: Boolean(primaryBot?.connected),
      qr: primaryBot?.qr || '',
      pairingCode: primaryBot?.pairingCode || '',
      pairingStatus: primaryBot?.pairingStatus || 'No session'
    };
    const systemStats = botManager ? await botManager.getSystemStats() : null;
    const fallbackState = botState || {
      isConnected: false,
      qr: null,
      pairingCode: '',
      pairingStatus: 'No session'
    };
    const memory = process.memoryUsage();
    const groups = Object.keys(data.chats).filter((jid) => jid.endsWith('@g.us')).length;
    const qrImage = primaryState.qr
      ? await QRCode.toDataURL(primaryState.qr, { width: 320, margin: 1 })
      : '';
    res.json({
      botName: config.botName,
      connected: sessions.some((session) => session.connected) || primaryState.isConnected,
      sessions,
      totalSession: sessions.length,
      maxSession: config.maxSession,
      uptime: formatDuration(process.uptime() * 1000),
      memoryUsage: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      cpuUsage: os.loadavg()[0].toFixed(2),
      totalGroup: systemStats?.totalGroup ?? groups,
      totalUser: systemStats?.totalUser ?? Object.keys(data.users).length,
      totalChat: Object.keys(data.chats).length,
      pairingStatus: primaryState.pairingStatus || fallbackState.pairingStatus,
      pairingCode: primaryState.pairingCode || fallbackState.pairingCode || '',
      qr: primaryState.qr || fallbackState.qr || '',
      qrImage,
      systemStats,
      logs: activityLogs.slice(0, 80)
    });
  });

  if (botManager) {
    app.get('/api/bots', asyncRoute(async (_, res) => {
      res.json({ ok: true, data: botManager.getBots() });
    }));

    app.post('/api/bots', asyncRoute(async (req, res) => {
      const bot = await botManager.createBot(req.body.phone || req.body.phone_number || req.body.phoneNumber || req.body.id);
      res.status(201).json({ ok: true, data: bot });
    }));

    app.get('/api/bots/:id', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: botManager.getBot(req.params.id) });
    }));

    app.delete('/api/bots/:id', asyncRoute(async (req, res) => {
      await botManager.removeBot(req.params.id);
      res.json({ ok: true });
    }));

    app.post('/api/bots/:id/start', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.startBot(req.params.id) });
    }));

    app.post('/api/bots/:id/stop', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.stopBot(req.params.id) });
    }));

    app.post('/api/bots/:id/restart', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.restartBot(req.params.id) });
    }));

    app.get('/api/bots/:id/info', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.getBotInfo(req.params.id) });
    }));

    app.get('/api/bots/:id/groups', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.getBotGroups(req.params.id) });
    }));

    app.get('/api/bots/:id/users', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.getBotUsers(req.params.id) });
    }));

    app.get('/api/bots/:id/stats', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: botManager.getBotStats(req.params.id) });
    }));

    app.get('/api/system/stats', asyncRoute(async (_, res) => {
      res.json({ ok: true, data: await botManager.getSystemStats() });
    }));

    app.post('/api/broadcast', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.broadcast(req.body) });
    }));

    app.post('/api/commands/reload', asyncRoute(async (_, res) => {
      res.json({ ok: true, data: await botManager.reloadCommands() });
    }));

    // ─────────────────────────────────────────────
    // Plugin Manager REST API
    // ─────────────────────────────────────────────

    // GET /api/plugins?botId=xxx  — list semua plugin (opsional filter per-bot)
    app.get('/api/plugins', asyncRoute(async (req, res) => {
      const botId = req.query.botId || null;
      res.json({ ok: true, data: botManager.getPlugins(botId) });
    }));

    // GET /api/plugins/search?q=query  — cari plugin
    app.get('/api/plugins/search', asyncRoute(async (req, res) => {
      const query = req.query.q || req.query.query || '';
      res.json({ ok: true, data: botManager.searchPlugin(query) });
    }));

    // GET /api/plugins/:name  — detail satu plugin
    app.get('/api/plugins/:name', asyncRoute(async (req, res) => {
      const plugin = botManager.getPlugin(req.params.name);
      if (!plugin) return res.status(404).json({ ok: false, error: `Plugin "${req.params.name}" tidak ditemukan.` });
      return res.json({ ok: true, data: plugin });
    }));

    // POST /api/plugins/reload-all  — reload semua plugin
    app.post('/api/plugins/reload-all', asyncRoute(async (_, res) => {
      res.json({ ok: true, data: await botManager.reloadPlugins() });
    }));

    // POST /api/plugins/reload  — reload semua plugin (alias lama)
    app.post('/api/plugins/reload', asyncRoute(async (_, res) => {
      res.json({ ok: true, data: await botManager.reloadPlugins() });
    }));

    // POST /api/plugins/:name/reload  — reload satu plugin
    app.post('/api/plugins/:name/reload', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.reloadPlugin(req.params.name) });
    }));

    // POST /api/plugins/:name/enable  — enable plugin (global)
    app.post('/api/plugins/:name/enable', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.enablePlugin(req.params.name) });
    }));

    // POST /api/plugins/:name/disable  — disable plugin (global)
    app.post('/api/plugins/:name/disable', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.disablePlugin(req.params.name) });
    }));

    // POST /api/plugins/install  — install plugin baru
    // Body: { filePath, category?, filename? }
    app.post('/api/plugins/install', asyncRoute(async (req, res) => {
      const result = await botManager.installPlugin(req.body);
      res.status(201).json({ ok: true, data: result });
    }));

    // POST /api/plugins/:name/uninstall  — uninstall plugin (hapus dari registry, file tetap)
    app.post('/api/plugins/:name/uninstall', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.uninstallPlugin(req.params.name) });
    }));

    // DELETE /api/plugins/:name  — hapus plugin (dari registry + file fisik)
    app.delete('/api/plugins/:name', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.deletePlugin(req.params.name) });
    }));

    // ─────────────────────────────────────────────
    // Scheduler Manager REST API
    // ─────────────────────────────────────────────

    // GET /api/schedulers — list all jobs
    app.get('/api/schedulers', asyncRoute(async (req, res) => {
      const scheduler = botManager.schedulerManager;
      const jobs = await scheduler.getJobs();
      res.json({ ok: true, data: jobs });
    }));

    // GET /api/schedulers/:id — get one job
    app.get('/api/schedulers/:id', asyncRoute(async (req, res) => {
      const scheduler = botManager.schedulerManager;
      const job = await scheduler.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ ok: false, error: `Job with ID "${req.params.id}" not found.` });
      }
      res.json({ ok: true, data: job });
    }));

    // POST /api/schedulers — create job
    app.post('/api/schedulers', asyncRoute(async (req, res) => {
      const scheduler = botManager.schedulerManager;
      const job = await scheduler.createJob(req.body);
      res.status(201).json({ ok: true, data: job });
    }));

    // PUT /api/schedulers/:id — update job
    app.put('/api/schedulers/:id', asyncRoute(async (req, res) => {
      const scheduler = botManager.schedulerManager;
      const job = await scheduler.updateJob(req.params.id, req.body);
      res.json({ ok: true, data: job });
    }));

    // DELETE /api/schedulers/:id — delete job
    app.delete('/api/schedulers/:id', asyncRoute(async (req, res) => {
      const scheduler = botManager.schedulerManager;
      const job = await scheduler.deleteJob(req.params.id);
      res.json({ ok: true, data: job });
    }));

    // POST /api/schedulers/:id/pause — pause job
    app.post('/api/schedulers/:id/pause', asyncRoute(async (req, res) => {
      const scheduler = botManager.schedulerManager;
      const job = await scheduler.pauseJob(req.params.id);
      res.json({ ok: true, data: job });
    }));

    // POST /api/schedulers/:id/resume — resume job
    app.post('/api/schedulers/:id/resume', asyncRoute(async (req, res) => {
      const scheduler = botManager.schedulerManager;
      const job = await scheduler.resumeJob(req.params.id);
      res.json({ ok: true, data: job });
    }));

    // POST /api/schedulers/:id/run — run job immediately
    app.post('/api/schedulers/:id/run', asyncRoute(async (req, res) => {
      const scheduler = botManager.schedulerManager;
      const job = await scheduler.runNow(req.params.id);
      res.json({ ok: true, data: job });
    }));

    // POST /api/schedulers/:id/cancel — cancel job
    app.post('/api/schedulers/:id/cancel', asyncRoute(async (req, res) => {
      const scheduler = botManager.schedulerManager;
      const job = await scheduler.cancelJob(req.params.id);
      res.json({ ok: true, data: job });
    }));

    // ─────────────────────────────────────────────
    // Queue Manager REST API
    // ─────────────────────────────────────────────

    // GET /api/queues/stats — get stats for all queues
    app.get('/api/queues/stats', asyncRoute(async (req, res) => {
      const queueName = req.query.name || null;
      const stats = botManager.queueManager.getStats(queueName);
      res.json({ ok: true, data: stats });
    }));

    // GET /api/queues/:name — list all jobs in a specific queue
    app.get('/api/queues/:name', asyncRoute(async (req, res) => {
      const queue = botManager.queueManager.getQueue(req.params.name);
      res.json({ ok: true, data: queue });
    }));

    // GET /api/queues/jobs/:id — get one job by ID
    app.get('/api/queues/jobs/:id', asyncRoute(async (req, res) => {
      const job = botManager.queueManager.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ ok: false, error: `Job with ID "${req.params.id}" not found.` });
      }
      res.json({ ok: true, data: job });
    }));

    // POST /api/queues/:name/enqueue — enqueue a job
    app.post('/api/queues/:name/enqueue', asyncRoute(async (req, res) => {
      const job = botManager.queueManager.enqueue(req.params.name, req.body.data, req.body.options);
      res.status(201).json({ ok: true, data: job });
    }));

    // POST /api/queues/jobs/:id/cancel — cancel a job
    app.post('/api/queues/jobs/:id/cancel', asyncRoute(async (req, res) => {
      const job = botManager.queueManager.cancel(req.params.id);
      res.json({ ok: true, data: job });
    }));

    // POST /api/queues/jobs/:id/retry — retry a failed/cancelled job
    app.post('/api/queues/jobs/:id/retry', asyncRoute(async (req, res) => {
      const job = botManager.queueManager.retry(req.params.id);
      res.json({ ok: true, data: job });
    }));

    // POST /api/queues/:name/pause — pause a queue
    app.post('/api/queues/:name/pause', asyncRoute(async (req, res) => {
      botManager.queueManager.pause(req.params.name);
      res.json({ ok: true, message: `Queue "${req.params.name}" paused.` });
    }));

    // POST /api/queues/:name/resume — resume a queue
    app.post('/api/queues/:name/resume', asyncRoute(async (req, res) => {
      botManager.queueManager.resume(req.params.name);
      res.json({ ok: true, message: `Queue "${req.params.name}" resumed.` });
    }));

    // POST /api/queues/:name/clear — clear non-running jobs in a queue
    app.post('/api/queues/:name/clear', asyncRoute(async (req, res) => {
      botManager.queueManager.clear(req.params.name);
      res.json({ ok: true, message: `Queue "${req.params.name}" cleared.` });
    }));

    // ─────────────────────────────────────────────
    // Per-Bot Plugin Config
    // ─────────────────────────────────────────────

    // GET /api/bots/:id/plugins  — get plugin list untuk bot tertentu
    app.get('/api/bots/:id/plugins', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: botManager.getPluginsForBot(req.params.id) });
    }));

    // POST /api/bots/:id/plugins/:name/enable  — enable plugin untuk bot tertentu
    app.post('/api/bots/:id/plugins/:name/enable', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.enablePlugin(req.params.name, req.params.id) });
    }));

    // POST /api/bots/:id/plugins/:name/disable  — disable plugin untuk bot tertentu
    app.post('/api/bots/:id/plugins/:name/disable', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.disablePlugin(req.params.name, req.params.id) });
    }));

    app.get('/api/sessions', asyncRoute(async (_, res) => {
      res.json({ ok: true, data: botManager.getBots() });
    }));

    app.get('/api/sessions/:id', asyncRoute(async (req, res) => {
      const session = botManager.getBot(req.params.id);
      if (!session) return res.status(404).json({ ok: false, error: 'Session tidak ditemukan' });
      return res.json({ ok: true, data: session });
    }));

    app.post('/api/sessions', asyncRoute(async (req, res) => {
      const session = await botManager.createBot(req.body.phone_number || req.body.phoneNumber || req.body.id);
      res.status(201).json({ ok: true, data: session });
    }));

    app.delete('/api/sessions/:id', asyncRoute(async (req, res) => {
      await botManager.removeBot(req.params.id);
      res.json({ ok: true });
    }));

    app.post('/api/sessions/:id/reconnect', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.startBot(req.params.id) });
    }));

    app.post('/api/sessions/:id/disconnect', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.stopBot(req.params.id) });
    }));

    app.post('/api/sessions/:id/restart', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.restartBot(req.params.id) });
    }));

    app.get('/api/sessions/:id/groups', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.getBotGroups(req.params.id) });
    }));

    app.get('/api/sessions/:id/info', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await botManager.getBotInfo(req.params.id) });
    }));

    app.post('/api/send', asyncRoute(async (req, res) => {
      const result = await botManager.sendMessage(req.body);
      res.json({ ok: true, data: result });
    }));

    app.post('/api/pair', asyncRoute(async (req, res) => {
      const result = await botManager.pairBot(req.body.phone_number || req.body.phoneNumber);
      res.json({ ok: true, ...result });
    }));
  }

  app.post('/api/restart', (_, res) => {
    res.json({ ok: true });
    setTimeout(restart, 500);
  });

  const server = app.listen(config.port, () => logger.success(`Dashboard: http://localhost:${config.port}`));
  const wss = new WebSocketServer({ server });
  botManager?.on('*', (event) => {
    const payload = JSON.stringify({ type: 'event', data: event });
    wss.clients.forEach((client) => client.readyState === 1 && client.send(payload));
  });
  setInterval(() => {
    const payload = JSON.stringify({ type: 'tick' });
    wss.clients.forEach((client) => client.readyState === 1 && client.send(payload));
  }, 3000);
  return server;
};
