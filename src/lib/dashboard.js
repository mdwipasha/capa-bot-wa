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
    res.status(400).json({ ok: false, error: error.message });
  }
};

export const startDashboard = ({ botState, sessionService, restart }) => {
  const app = express();
  app.use(express.json());
  app.use(express.static(publicDir));

  app.get('/api/status', async (_, res) => {
    const data = await db.read();
    const sessions = sessionService ? await sessionService.listSessions() : [];
    const primaryState = botState || sessionService?.getAllSessions()?.[0]?.botState || {
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
      maxSession: sessionService?.getLimit?.() || config.maxSession,
      uptime: formatDuration(process.uptime() * 1000),
      memoryUsage: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      cpuUsage: os.loadavg()[0].toFixed(2),
      totalGroup: groups,
      totalUser: Object.keys(data.users).length,
      totalChat: Object.keys(data.chats).length,
      pairingStatus: primaryState.pairingStatus,
      pairingCode: primaryState.pairingCode || '',
      qr: primaryState.qr || '',
      qrImage,
      logs: activityLogs.slice(0, 80)
    });
  });

  if (sessionService) {
    app.get('/api/sessions', asyncRoute(async (_, res) => {
      res.json({ ok: true, data: await sessionService.listSessions() });
    }));

    app.get('/api/sessions/:id', asyncRoute(async (req, res) => {
      const session = await sessionService.getSessionDetail(req.params.id);
      if (!session) return res.status(404).json({ ok: false, error: 'Session tidak ditemukan' });
      return res.json({ ok: true, data: session });
    }));

    app.post('/api/sessions', asyncRoute(async (req, res) => {
      const session = await sessionService.createSession(req.body.phone_number || req.body.phoneNumber || req.body.id);
      res.status(201).json({ ok: true, data: await sessionService.getSessionDetail(session.id) });
    }));

    app.delete('/api/sessions/:id', asyncRoute(async (req, res) => {
      await sessionService.removeSession(req.params.id);
      res.json({ ok: true });
    }));

    app.post('/api/sessions/:id/reconnect', asyncRoute(async (req, res) => {
      await sessionService.reconnectSession(req.params.id);
      res.json({ ok: true, data: await sessionService.getSessionDetail(req.params.id) });
    }));

    app.post('/api/sessions/:id/disconnect', asyncRoute(async (req, res) => {
      await sessionService.disconnectSession(req.params.id);
      res.json({ ok: true, data: await sessionService.getSessionDetail(req.params.id) });
    }));

    app.post('/api/sessions/:id/restart', asyncRoute(async (req, res) => {
      await sessionService.restartSession(req.params.id);
      res.json({ ok: true, data: await sessionService.getSessionDetail(req.params.id) });
    }));

    app.get('/api/sessions/:id/groups', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await sessionService.getGroups(req.params.id) });
    }));

    app.get('/api/sessions/:id/info', asyncRoute(async (req, res) => {
      res.json({ ok: true, data: await sessionService.getInfo(req.params.id) });
    }));

    app.post('/api/send', asyncRoute(async (req, res) => {
      const result = await sessionService.sendMessage(req.body);
      res.json({ ok: true, data: result });
    }));

    app.post('/api/pair', asyncRoute(async (req, res) => {
      const result = await sessionService.requestPairingCode(req.body.phone_number || req.body.phoneNumber);
      res.json({ ok: true, ...result });
    }));
  }

  app.post('/api/restart', (_, res) => {
    res.json({ ok: true });
    setTimeout(restart, 500);
  });

  const server = app.listen(config.port, () => logger.success(`Dashboard: http://localhost:${config.port}`));
  const wss = new WebSocketServer({ server });
  setInterval(() => {
    const payload = JSON.stringify({ type: 'tick' });
    wss.clients.forEach((client) => client.readyState === 1 && client.send(payload));
  }, 3000);
  return server;
};
