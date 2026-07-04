import os from 'os';
import fs from 'fs-extra';
import { db } from '../database/index.js';
import { config } from '../config/env.js';
import { SessionManager } from '../session/services/SessionManager.js';
import { SessionService } from '../session/services/SessionService.js';
import { BotRegistry } from './BotRegistry.js';
import { EventBus } from './EventBus.js';
import { LoggerService } from './LoggerService.js';
import { MessageRouter } from './MessageRouter.js';
import { StatsManager } from './StatsManager.js';
import { SchedulerManager } from './SchedulerManager.js';
import { QueueManager } from './QueueManager.js';
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
    pluginManager = null,
    commandManager = null,
    schedulerManager = null,
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

    // SchedulerManager: pusat pengelolaan scheduled tasks (baru)
    this.schedulerManager = schedulerManager
      || new SchedulerManager({ database, eventBus, loggerService, botManager: this });
    this.schedulerManager.setBotManager(this);

    // QueueManager: pusat pengelolaan antrian pekerjaan berat (baru)
    this.queueManager = new QueueManager({ loggerService });
    this._registerQueueWorkers();

    // CommandManager: pusat pengelolaan command (baru)
    this.commandManager = commandManager || null;

    // PluginManager: gunakan yang diinject, atau ambil dari loader adapter
    this.pluginManager = pluginManager
      || loader?.getPluginManager?.()
      || null;

    // Resolve loader proxy: CommandManager (prioritas) → loader langsung
    const resolvedLoader = commandManager || loader;

    this.messageRouter = new MessageRouter({
      loader: resolvedLoader,
      eventBus,
      statsManager: this.stats,
      loggerService,
      disabledCommands: this.disabledCommands,
      pluginManager: this.pluginManager,
      commandManager
    });
    this.messageRouter.botManager = this;
    this.sessionManager = new SessionManager({
      loader: resolvedLoader,
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
      delayMs = 500,
      priority = 0
    } = options;
    if (!message) throw new Error('message wajib diisi');

    const jobs = await this.buildBroadcastJobs({ sessionId, message, target, filter });
    
    // Dynamically adjust concurrency for the broadcast worker
    const workerConfig = this.queueManager.workers.get('Broadcast Queue');
    if (workerConfig) {
      workerConfig.concurrency = Math.max(1, concurrency);
    }

    const enqueuedJobs = [];
    for (const job of jobs) {
      const eq = this.queueManager.enqueue('Broadcast Queue', {
        sessionId: job.sessionId,
        jid: job.jid,
        message: job.message,
        delayMs
      }, {
        priority,
        maxRetry: retry,
        preventDuplicate: true,
        deduplicationKey: 'jid'
      });
      enqueuedJobs.push(eq);
    }

    return {
      total: enqueuedJobs.length,
      sent: 0,
      failed: 0,
      jobs: enqueuedJobs.map((j) => ({ id: j.id, status: j.status }))
    };
  }

  async sendMessage({ sessionId, phone, message, jid }) {
    const session = this.requireOnlineSession(sessionId);
    const to = jid || `${this.normalize(phone)}@s.whatsapp.net`;
    if (!message) throw new Error('message wajib diisi');
    return session.sock.sendMessage(to, { text: message });
  }

  async loadPlugins() {
    if (this.commandManager) {
      const commands = await this.commandManager.loadCommands();
      this.emit('plugin.loaded', { total: commands.length });
      return commands;
    }
    if (this.pluginManager) {
      const plugins = await this.pluginManager.loadPlugins();
      this.emit('plugin.loaded', { total: plugins.length });
      return plugins;
    }
    await this.loader.load();
    this.emit('plugin.loaded', { total: this.loader.list().length });
    return this.loader.list();
  }

  async reloadPlugins() {
    if (this.commandManager) {
      const commands = await this.commandManager.reloadCommands();
      this.stats.increment('system', 'pluginReload');
      this.messageRouter.clear();
      this.emit('plugin.reloaded', { total: commands.length });
      return commands;
    }
    if (this.pluginManager) {
      const plugins = await this.pluginManager.reloadPlugins();
      this.stats.increment('system', 'pluginReload');
      this.messageRouter.clear();
      this.emit('plugin.reloaded', { total: plugins.length });
      return plugins;
    }
    await this.loader.load();
    this.stats.increment('system', 'pluginReload');
    this.messageRouter.clear();
    this.emit('plugin.reloaded', { total: this.loader.list().length });
    return this.loader.list();
  }

  async reloadPlugin(name) {
    if (this.commandManager) {
      const command = await this.commandManager.reloadCommand(name).catch(async () => {
        // Fallback ke pluginManager jika command tidak ditemukan di CommandManager
        if (!this.pluginManager) throw new PluginError('PluginManager tidak tersedia.');
        return this.pluginManager.reloadPlugin(name);
      });
      this.messageRouter.clear();
      this.emit('plugin.reloaded', { name });
      return command;
    }
    if (!this.pluginManager) throw new PluginError('PluginManager tidak tersedia.');
    const plugin = await this.pluginManager.reloadPlugin(name);
    this.messageRouter.clear();
    this.emit('plugin.reloaded', { name });
    return plugin;
  }

  async enablePlugin(name, botId = null) {
    if (this.pluginManager) {
      const result = botId
        ? this.pluginManager.enablePluginForBot(name, botId)
        : await this.pluginManager.enablePlugin(name);
      this.disabledPlugins.delete(name);
      this.messageRouter.clear();
      this.emit('plugin.enabled', { name, botId });
      return result;
    }
    this.disabledPlugins.delete(name);
    this.emit('plugin.loaded', { plugin: name });
    return { name, enabled: true };
  }

  async disablePlugin(name, botId = null) {
    if (this.pluginManager) {
      const result = botId
        ? this.pluginManager.disablePluginForBot(name, botId)
        : await this.pluginManager.disablePlugin(name);
      this.disabledPlugins.add(name);
      this.messageRouter.clear();
      this.emit('plugin.disabled', { name, botId });
      return result;
    }
    this.disabledPlugins.add(name);
    this.emit('plugin.unloaded', { plugin: name });
    return { name, enabled: false };
  }

  async deletePlugin(name) {
    if (!this.pluginManager) {
      throw new PluginError(`Delete plugin ${name} belum didukung oleh storage plugin saat ini`);
    }
    return this.pluginManager.deletePlugin(name);
  }

  async installPlugin(options) {
    if (!this.pluginManager) {
      throw new PluginError('Install plugin belum didukung oleh storage plugin saat ini');
    }
    return this.pluginManager.installPlugin(options);
  }

  async uninstallPlugin(name) {
    if (!this.pluginManager) {
      throw new PluginError(`Uninstall plugin ${name} belum didukung.`);
    }
    return this.pluginManager.uninstallPlugin(name);
  }

  getPlugins(botId = null) {
    if (this.commandManager) return this.commandManager.getCommands(botId);
    if (this.pluginManager) return this.pluginManager.getPlugins(botId);
    return this.loader.list();
  }

  getPlugin(name, botId = null) {
    if (this.commandManager) return this.commandManager.getCommand(name, botId);
    if (this.pluginManager) return this.pluginManager.getPlugin(name, botId);
    return this.loader.get(name);
  }

  searchPlugin(query) {
    if (this.commandManager) return this.commandManager.searchCommand(query);
    if (this.pluginManager) return this.pluginManager.searchPlugin(query);
    return this.loader.list().filter((p) =>
      p.name?.includes(query) || p.description?.includes(query)
    );
  }

  getPluginsForBot(botId) {
    if (this.commandManager) return this.commandManager.getCommands(botId);
    if (this.pluginManager) return this.pluginManager.getPluginsForBot(botId);
    return this.loader.list();
  }

  async loadCommands() {
    return this.loadPlugins();
  }

  async reloadCommands() {
    return this.reloadPlugins();
  }

  async enableCommand(name, botId = null) {
    if (this.commandManager) {
      const result = await this.commandManager.enableCommand(name, botId);
      this.messageRouter.clear();
      return result;
    }
    this.disabledCommands.delete(name);
    this.messageRouter.clear();
    this.emit('command.enabled', { name, botId });
    return { name, enabled: true };
  }

  async disableCommand(name, botId = null) {
    if (this.commandManager) {
      const result = await this.commandManager.disableCommand(name, botId);
      this.messageRouter.clear();
      return result;
    }
    this.disabledCommands.add(name);
    this.messageRouter.clear();
    this.emit('command.disabled', { name, botId });
    return { name, enabled: false };
  }

  async deleteCommand(name) {
    if (this.commandManager) {
      return this.commandManager.deleteCommand(name);
    }
    throw new CommandError(`Delete command ${name} belum didukung oleh command loader saat ini`);
  }

  // ─────────────────────────────────────────────
  // Command Manager — Extended API
  // ─────────────────────────────────────────────

  /**
   * Ambil semua command (delegasi ke CommandManager jika tersedia).
   * @param {string|null} [botId=null]
   * @returns {object[]}
   */
  getCommands(botId = null) {
    return this.getPlugins(botId);
  }

  /**
   * Ambil satu command by name.
   * @param {string} name
   * @param {string|null} [botId=null]
   * @returns {object|null}
   */
  getCommand(name, botId = null) {
    return this.getPlugin(name, botId);
  }

  /**
   * Cari command by query.
   * @param {string} query
   * @returns {object[]}
   */
  searchCommand(query) {
    return this.searchPlugin(query);
  }

  /**
   * Reload satu command by name.
   * @param {string} name
   * @returns {Promise<object>}
   */
  async reloadCommand(name) {
    return this.reloadPlugin(name);
  }

  /**
   * Ambil statistik semua command.
   * @returns {object[]}
   */
  getStatistics() {
    if (this.commandManager) return this.commandManager.getStatistics();
    return [];
  }

  /**
   * Generate menu otomatis.
   * @param {object} [options]
   * @returns {string}
   */
  getMenu(options = {}) {
    if (this.commandManager) return this.commandManager.getMenu(options);
    return '';
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

  _registerQueueWorkers() {
    // 1. Broadcast Queue worker
    this.queueManager.registerWorker('Broadcast Queue', async (job) => {
      const { sessionId, jid, message, delayMs } = job.data;
      const session = this.requireOnlineSession(sessionId);
      await session.sock.sendMessage(jid, { text: message });
      if (delayMs) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      this.stats.increment(sessionId, 'broadcast');
    }, { concurrency: 2 });

    // 2. Default workers for other queue types
    const defaultQueues = [
      'Message Queue',
      'Download Queue',
      'Sticker Queue',
      'Video Queue',
      'Image Queue',
      'AI Queue',
      'OCR Queue'
    ];
    
    for (const q of defaultQueues) {
      this.queueManager.registerWorker(q, async (job, updateProgress) => {
        this.logger.info?.({ category: 'queue', message: `Executing job "${job.id}" in "${job.queueName}"` });
        
        // Simulate execution progress
        for (let i = 20; i <= 100; i += 20) {
          updateProgress(i);
          await new Promise((r) => setTimeout(r, 100));
        }
        
        return { success: true, timestamp: Date.now() };
      }, { concurrency: 2 });
    }

    // 3. Upload Queue worker (with auto-backup support)
    this.queueManager.registerWorker('Upload Queue', async (job, updateProgress) => {
      this.logger.info?.({ category: 'queue', message: `Executing Upload job "${job.id}"` });
      if (job.data?.type === 'auto-backup') {
        updateProgress(10);
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        await fs.ensureDir('backups');
        updateProgress(50);
        const backupFile = `backups/database-${stamp}.json`;
        await fs.copy(job.data.databasePath || config.databasePath, backupFile);
        updateProgress(100);
        this.logger.success?.({ category: 'queue', message: `Auto backup database saved to: ${backupFile}` });
        return { backupFile };
      }

      // Default upload job simulation
      for (let i = 20; i <= 100; i += 20) {
        updateProgress(i);
        await new Promise((r) => setTimeout(r, 100));
      }
      return { success: true };
    }, { concurrency: 2 });
  }

  normalize(value = '') {
    return String(value).replace(/\D/g, '');
  }
}
