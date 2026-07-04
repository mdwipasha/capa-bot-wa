import os from 'os';
import { db } from '../database/index.js';

const emptyStats = () => ({
  messagesSent: 0,
  messagesReceived: 0,
  commandsExecuted: 0,
  errors: 0,
  reconnectCount: 0,
  pluginReload: 0,
  broadcast: 0,
  startedAt: Date.now(),
  lastActive: null
});

export class StatsManager {
  constructor({ database = db, loader = null } = {}) {
    this.db = database;
    this.loader = loader;
    this.botStats = new Map();
  }

  ensure(sessionId) {
    if (!this.botStats.has(sessionId)) this.botStats.set(sessionId, emptyStats());
    return this.botStats.get(sessionId);
  }

  increment(sessionId, key, amount = 1) {
    const stats = this.ensure(sessionId || 'system');
    stats[key] = (stats[key] || 0) + amount;
    stats.lastActive = Date.now();
    return stats;
  }

  markActive(sessionId) {
    const stats = this.ensure(sessionId || 'system');
    stats.lastActive = Date.now();
    return stats;
  }

  getBotStats(sessionId) {
    const stats = this.ensure(sessionId);
    return {
      ...stats,
      uptime: Date.now() - stats.startedAt
    };
  }

  getPluginCount() {
    return this.loader?.list?.().length || 0;
  }

  getCommandCount() {
    return this.loader?.list?.().length || 0;
  }

  async getSystemStats(bots = []) {
    const data = await this.db.read();
    const memory = process.memoryUsage();
    const totalGroup = Object.keys(data.chats || {}).filter((jid) => jid.endsWith('@g.us')).length;
    const totalUser = Object.keys(data.users || {}).length;

    return {
      totalBot: bots.length,
      botOnline: bots.filter((bot) => bot.connected).length,
      botOffline: bots.filter((bot) => !bot.connected).length,
      cpuUsage: os.loadavg()[0].toFixed(2),
      ramUsage: {
        rss: memory.rss,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        label: `${Math.round(memory.rss / 1024 / 1024)} MB`
      },
      diskUsage: null,
      nodeVersion: process.version,
      os: os.type(),
      platform: process.platform,
      totalPlugin: this.getPluginCount(),
      totalCommand: this.getCommandCount(),
      totalGroup,
      totalUser
    };
  }
}
