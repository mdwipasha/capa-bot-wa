import os from 'os';
import { db } from '../database/index.js';
import { config } from '../config/env.js';
import { SessionManager } from '../session/services/SessionManager.js';
import { SessionService } from '../session/services/SessionService.js';
import { BotRegistry } from './BotRegistry.js';
import { EventBus } from './EventBus.js';
import { LoggerService } from './LoggerService.js';
import { MessageRouter } from './MessageRouter.js';
import { StatsManager } from './StatsManager.js';
import {
  BotNotFoundError,
  BotOfflineError,
  CommandError,
  PluginError,
  SessionExpiredError
} from './BotErrors.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class BotManager {
  constructor({
    loader,
    database = db,
    eventBus = new EventBus(),
    loggerService = new LoggerService()
  } = {}) {
    this.loader = loader;
    this.db = database;
    this.eventBus = eventBus;
    this.logger = loggerService;
    this.registry = new BotRegistry();
    this.stats = new StatsManager({ database, loader });
    this.disabledCommands = new Set();
    this.disabledPlugins = new Set();
    this.jobs = new Map();

    this.messageRouter = new MessageRouter({
      loader,
      eventBus,
      statsManager: this.stats,
      loggerService,
      disabledCommands: this.disabledCommands
    });
    this.messageRouter.botManager = this;
    this.sessionManager = new SessionManager({
      loader,
      messageRouter: this.messageRouter,
      eventBus,
      statsManager: this.stats
    });
    this.sessionService = new SessionService(this.sessionManager);
  }

  on(event, listener) {
    this.eventBus.on(event, listener);
    return this;
  }

  off(event, listener) {
    this.eventBus.off(event, listener);
    return this;
  }

  emit(event, payload = {}) {
    this.eventBus.emitEvent(event, payload);
  }

  async restoreBots() {
    await this.sessionService.restoreSessions();
    this.syncRegistry();
    if (!this.getBots().length && config.ownerNumber) await this.createBot(config.ownerNumber);
    return this.getBots();
  }

  syncRegistry() {
    return this.registry.sync(this.sessionService.getAllSessions().map((session) => this.toBot(session)));
  }

  getBots() {
    this.syncRegistry();
    return this.registry.all();
  }

  getBot(sessionId) {
    this.syncRegistry();
    const bot = this.registry.get(this.normalize(sessionId));
    if (!bot) throw new BotNotFoundError(sessionId);
    return bot;
  }

  async createBot(phone) {
    const session = await this.sessionService.createSession(phone);
    const bot = this.registry.set(session.id, this.toBot(session));
    return bot;
  }

  async removeBot(sessionId) {
    const id = this.normalize(sessionId);
    await this.sessionService.removeSession(id);
    this.registry.delete(id);
    this.messageRouter.clear(id);
    return { ok: true };
  }

  async restartBot(sessionId) {
    const id = this.normalize(sessionId);
    await this.sessionService.restartSession(id);
    this.emit('bot.restart', { sessionId: id });
    return this.getBot(id);
  }

  async stopBot(sessionId) {
    const id = this.normalize(sessionId);
    await this.sessionService.disconnectSession(id);
    return this.getBot(id);
  }

  async startBot(sessionId) {
    const id = this.normalize(sessionId);
    await this.sessionService.reconnectSession(id);
    return this.getBot(id);
  }

  pairBot(phone) {
    return this.sessionService.requestPairingCode(phone);
  }

  async getBotInfo(sessionId) {
    const id = this.normalize(sessionId);
    const info = await this.sessionService.getInfo(id);
    const session = this.sessionService.getSession(id);
    if (!session) throw new BotNotFoundError(id);

    let profilePicture = '';
    if (session.sock?.profilePictureUrl) {
      profilePicture = await session.sock.profilePictureUrl(session.sock.user?.id, 'image').catch(() => '');
    }

    return {
      ...this.toBot(session),
      ...info,
      profilePicture,
      stats: this.getBotStats(id)
    };
  }

  getBotGroups(sessionId) {
    return this.sessionService.getGroups(sessionId);
  }

  async getBotUsers(sessionId) {
    this.getBot(sessionId);
    const data = await this.db.read();
    return Object.entries(data.users || {}).map(([id, user]) => ({ id, ...user }));
  }

  getBotStats(sessionId) {
    this.getBot(sessionId);
    return this.stats.getBotStats(this.normalize(sessionId));
  }

  async getSystemStats() {
    return this.stats.getSystemStats(this.getBots());
  }

  async broadcast(options = {}) {
    const {
      sessionId = null,
      message = '',
      target = 'chats',
      filter = null,
      concurrency = 2,
      retry = 2,
      delayMs = 500
    } = options;
    if (!message) throw new Error('message wajib diisi');

    const jobs = await this.buildBroadcastJobs({ sessionId, message, target, filter });
    const result = await this.runQueue(jobs, {
      concurrency,
      retry,
      delayMs,
      worker: async (job) => {
        const session = this.requireOnlineSession(job.sessionId);
        await session.sock.sendMessage(job.jid, { text: job.message });
      }
    });
    for (const botId of new Set(jobs.map((job) => job.sessionId))) this.stats.increment(botId, 'broadcast');
    this.emit('broadcast', { total: jobs.length, result });
    return result;
  }

  async sendMessage({ sessionId, phone, message, jid }) {
    const session = this.requireOnlineSession(sessionId);
    const to = jid || `${this.normalize(phone)}@s.whatsapp.net`;
    if (!message) throw new Error('message wajib diisi');
    return session.sock.sendMessage(to, { text: message });
  }

  async loadPlugins() {
    await this.loader.load();
    this.emit('plugin.loaded', { total: this.loader.list().length });
    return this.loader.list();
  }

  async reloadPlugins() {
    await this.loader.load();
    this.stats.increment('system', 'pluginReload');
    this.messageRouter.clear();
    this.emit('plugin.reloaded', { total: this.loader.list().length });
    return this.loader.list();
  }

  enablePlugin(name) {
    this.disabledPlugins.delete(name);
    this.emit('plugin.loaded', { plugin: name });
    return { name, enabled: true };
  }

  disablePlugin(name) {
    this.disabledPlugins.add(name);
    this.emit('plugin.unloaded', { plugin: name });
    return { name, enabled: false };
  }

  deletePlugin(name) {
    throw new PluginError(`Delete plugin ${name} belum didukung oleh storage plugin saat ini`);
  }

  installPlugin(name) {
    throw new PluginError(`Install plugin ${name} belum didukung oleh storage plugin saat ini`);
  }

  async loadCommands() {
    await this.loader.load();
    this.emit('plugin.loaded', { total: this.loader.list().length });
    return this.loader.list();
  }

  async reloadCommands() {
    await this.loader.load();
    this.messageRouter.clear();
    this.emit('plugin.reloaded', { total: this.loader.list().length });
    return this.loader.list();
  }

  enableCommand(name) {
    this.disabledCommands.delete(name);
    this.messageRouter.clear();
    return { name, enabled: true };
  }

  disableCommand(name) {
    this.disabledCommands.add(name);
    this.messageRouter.clear();
    return { name, enabled: false };
  }

  deleteCommand(name) {
    throw new CommandError(`Delete command ${name} belum didukung oleh command loader saat ini`);
  }

  scheduleJob(id, task, delayMs) {
    this.cancelJob(id);
    const job = {
      id,
      task,
      delayMs,
      paused: false,
      timeout: setTimeout(async () => {
        await task();
        this.jobs.delete(id);
      }, delayMs)
    };
    this.jobs.set(id, job);
    return job;
  }

  cancelJob(id) {
    const job = this.jobs.get(id);
    if (job?.timeout) clearTimeout(job.timeout);
    return this.jobs.delete(id);
  }

  pauseJob(id) {
    const job = this.jobs.get(id);
    if (!job) return false;
    if (job.timeout) clearTimeout(job.timeout);
    job.paused = true;
    return true;
  }

  resumeJob(id) {
    const job = this.jobs.get(id);
    if (!job || !job.paused) return false;
    job.paused = false;
    job.timeout = setTimeout(async () => {
      await job.task();
      this.jobs.delete(id);
    }, job.delayMs);
    return true;
  }

  async buildBroadcastJobs({ sessionId, message, target, filter }) {
    const sessions = sessionId
      ? [this.requireOnlineSession(sessionId)]
      : this.sessionService.getAllSessions().filter((session) => session.botState.isConnected);
    const data = await this.db.read();
    const allChats = Object.keys(data.chats || {});

    const jids = allChats.filter((jid) => {
      if (target === 'groups') return jid.endsWith('@g.us');
      if (target === 'users') return !jid.endsWith('@g.us');
      return true;
    }).filter((jid) => (typeof filter === 'function' ? filter(jid, data.chats[jid]) : true));

    return sessions.flatMap((session) => jids.map((jid) => ({
      sessionId: session.id,
      jid,
      message
    })));
  }

  async runQueue(jobs, { worker, concurrency = 2, retry = 2, delayMs = 500 } = {}) {
    const queue = [...jobs];
    const result = { total: jobs.length, sent: 0, failed: 0, errors: [] };
    const runJob = async (job) => {
      for (let attempt = 0; attempt <= retry; attempt += 1) {
        try {
          await worker(job);
          result.sent += 1;
          if (delayMs) await wait(delayMs);
          return;
        } catch (error) {
          if (attempt >= retry) {
            result.failed += 1;
            result.errors.push({ job, error: error.message });
            this.stats.increment(job.sessionId, 'errors');
          } else {
            await wait(250 * (attempt + 1));
          }
        }
      }
    };

    const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
      while (queue.length) await runJob(queue.shift());
    });
    await Promise.all(workers);
    return result;
  }

  requireOnlineSession(sessionId) {
    const id = this.normalize(sessionId);
    const session = this.sessionService.getSession(id);
    if (!session) throw new BotNotFoundError(id);
    if (session.status === 'LOGGED_OUT') throw new SessionExpiredError(id);
    if (!session.sock || !session.botState.isConnected) throw new BotOfflineError(id);
    return session;
  }

  toBot(session) {
    const stats = this.stats.getBotStats(session.id);
    return {
      sessionId: session.id,
      id: session.id,
      phoneNumber: session.phoneNumber,
      phone_number: session.phoneNumber,
      displayName: session.sock?.user?.name || session.sock?.user?.verifiedName || '',
      profilePicture: '',
      connected: Boolean(session.botState.isConnected),
      disconnected: !session.botState.isConnected,
      status: session.status,
      reconnectCount: stats.reconnectCount,
      createdDate: null,
      lastActive: stats.lastActive,
      uptime: stats.uptime,
      memoryUsage: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      cpuUsage: os.loadavg()[0].toFixed(2),
      pluginCount: this.stats.getPluginCount(),
      commandCount: this.stats.getCommandCount(),
      groupCount: 0,
      userCount: 0,
      pairingStatus: session.botState.pairingStatus,
      pairingCode: session.botState.pairingCode || '',
      qr: session.botState.qr || ''
    };
  }

  normalize(value = '') {
    return String(value).replace(/\D/g, '');
  }
}
