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

export const startDashboard = ({ botState, restart, stop }) => {
  const app = express();
  let controlInProgress = false;
  app.use(express.json());
  app.use(express.static(publicDir));

  app.get('/api/status', async (_, res) => {
    const data = await db.read();
    const memory = process.memoryUsage();
    const groups = Object.keys(data.chats).filter((jid) => jid.endsWith('@g.us')).length;
    const qrImage = botState.qr
      ? await QRCode.toDataURL(botState.qr, { width: 320, margin: 1 })
      : '';
    res.json({
      botName: config.botName,
      running: botState.isRunning,
      connected: botState.isConnected,
      uptime: formatDuration(process.uptime() * 1000),
      memoryUsage: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      cpuUsage: os.loadavg()[0].toFixed(2),
      totalGroup: groups,
      totalUser: Object.keys(data.users).length,
      totalChat: Object.keys(data.chats).length,
      ownerMode: Boolean(botState.ownerMode),
      pairingStatus: botState.pairingStatus,
      pairingCode: botState.pairingCode || '',
      qr: botState.qr || '',
      qrImage,
      logs: activityLogs.slice(0, 80)
    });
  });

  const runControl = async (res, action) => {
    if (controlInProgress) {
      res.status(409).json({ ok: false, error: 'Kontrol bot sedang diproses.' });
      return;
    }

    controlInProgress = true;
    try {
      await action();
      res.json({ ok: true });
    } catch (error) {
      logger.error('Dashboard control error', error.stack || error.message);
      res.status(500).json({ ok: false, error: error.message });
    } finally {
      controlInProgress = false;
    }
  };

  app.post('/api/restart', (_, res) => runControl(res, restart));
  app.post('/api/stop', (_, res) => runControl(res, stop));
  app.post('/api/owner-mode', (req, res) => {
    botState.ownerMode = Boolean(req.body?.enabled);
    logger.info(`Owner mode ${botState.ownerMode ? 'aktif' : 'nonaktif'} dari dashboard`);
    res.json({ ok: true, ownerMode: botState.ownerMode });
  });

  const server = app.listen(config.port, () => logger.success(`Dashboard: http://localhost:${config.port}`));
  const wss = new WebSocketServer({ server });
  setInterval(() => {
    const payload = JSON.stringify({ type: 'tick' });
    wss.clients.forEach((client) => client.readyState === 1 && client.send(payload));
  }, 3000);
  return server;
};
