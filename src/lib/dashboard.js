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

export const startDashboard = ({ botState, restart }) => {
  const app = express();
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
      connected: botState.isConnected,
      uptime: formatDuration(process.uptime() * 1000),
      memoryUsage: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      cpuUsage: os.loadavg()[0].toFixed(2),
      totalGroup: groups,
      totalUser: Object.keys(data.users).length,
      totalChat: Object.keys(data.chats).length,
      pairingStatus: botState.pairingStatus,
      pairingCode: botState.pairingCode || '',
      qr: botState.qr || '',
      qrImage,
      logs: activityLogs.slice(0, 80)
    });
  });

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
