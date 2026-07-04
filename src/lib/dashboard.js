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

    app.post('/api/plugins/reload', asyncRoute(async (_, res) => {
      res.json({ ok: true, data: await botManager.reloadPlugins() });
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
