import os from 'os';
import { promises as fs } from 'fs';
import { logger } from '../utils/logger.js';

export class SocketEvents {
  constructor(socketGateway, botManager) {
    this.gateway = socketGateway;
    this.botManager = botManager;
    this.sysInterval = null;
    this.lastCpuStats = null;
  }

  /**
   * Start listening to backend manager EventBus and hook log streams
   */
  start() {
    logger.info('[websocket] Starting Event Bridge...');

    // 1. Hook into event bus wildcard events
    if (this.botManager?.eventBus) {
      this.wildcardListener = (message) => this.forwardEvent(message);
      this.botManager.eventBus.on('*', this.wildcardListener);

      this.authLogoutListener = (message) => {
        const tokenJti = message?.tokenJti;
        if (!tokenJti || !this.gateway?.server) return;
        const disconnected = this.gateway.server.disconnectByTokenJti(tokenJti);
        if (disconnected > 0) {
          logger.info(`[websocket] Disconnected ${disconnected} socket(s) after auth.logout (JTI: ${tokenJti})`);
        }
      };
      this.botManager.eventBus.on('auth.logout', this.authLogoutListener);

      this.authLogoutAllListener = (message) => {
        const userId = message?.userId;
        if (!userId || !this.gateway?.server) return;
        const disconnected = this.gateway.server.disconnectByUserId(userId);
        if (disconnected > 0) {
          logger.info(`[websocket] Disconnected ${disconnected} socket(s) after auth.logout_all for user ${userId}`);
        }
      };
      this.botManager.eventBus.on('auth.logout_all', this.authLogoutAllListener);
    }

    // 2. Hook into Logger to stream realtime logs
    logger.onLog = (logEntry) => {
      // Broadcast to 'logs' room
      this.gateway.to('logs').emit('log.created', logEntry);
      
      if (logEntry.level === 'error') {
        this.gateway.to('logs').emit('log.error', logEntry);
      } else if (logEntry.level === 'warn') {
        this.gateway.to('logs').emit('log.warning', logEntry);
      }
    };

    // 3. Start periodic system metrics broadcast
    this.startSystemMetrics();
  }

  /**
   * Forward backend manager events to appropriate Socket.IO rooms
   */
  forwardEvent(payload) {
    const { event } = payload;
    if (!event) return;

    // Determine room by event category prefix
    let room = 'global';
    
    if (event.startsWith('bot.')) {
      room = 'bot';
    } else if (event.startsWith('session.')) {
      room = 'session';
    } else if (event.startsWith('plugin.')) {
      room = 'plugin';
    } else if (event.startsWith('command.')) {
      room = 'command';
    } else if (event.startsWith('job.')) {
      room = 'scheduler';
    } else if (event.startsWith('queue.')) {
      room = 'queue';
    } else if (event.startsWith('broadcast.')) {
      room = 'broadcast';
    }

    // Forward event to respective room
    this.gateway.to(room).emit(event, payload);
    
    // Also forward all events to global dashboard for overview monitoring
    this.gateway.to('global').emit(event, payload);
  }

  /**
   * Start periodic system CPU, memory, disk, and health ticks
   */
  startSystemMetrics() {
    this.stopSystemMetrics();

    // Broadcast initial state
    this.tickSystemMetrics();

    // Loop every 5 seconds
    this.sysInterval = setInterval(() => {
      this.tickSystemMetrics();
    }, 5000);
  }

  /**
   * Gather and emit CPU, RAM, Disk, Health usage metrics
   */
  async tickSystemMetrics() {
    if (!this.gateway.initialized) return;
    try {
      const memory = process.memoryUsage();
      const cpus = os.cpus();
      
      // Memory Stats
      const memoryStats = {
        rss: memory.rss,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        total: os.totalmem(),
        free: os.freemem(),
        percentage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1),
        label: `${Math.round(memory.rss / 1024 / 1024)} MB`
      };
      this.gateway.to('system').emit('memory.updated', memoryStats);

      // CPU Stats (calculate delta load usage)
      const cpuStats = this.getCpuUsage();
      if (cpuStats) {
        this.gateway.to('system').emit('cpu.updated', cpuStats);
      }

      // Disk Stats using standard Node statfs
      const diskStats = await this.getDiskUsage();
      if (diskStats) {
        this.gateway.to('system').emit('disk.updated', diskStats);
      }

      // Overall System Health Status
      const bots = this.botManager?.getBots?.() || [];
      const healthStats = {
        status: bots.some(b => b.connected) ? 'healthy' : 'warning',
        totalBots: bots.length,
        onlineBots: bots.filter(b => b.connected).length,
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: os.arch()
      };
      this.gateway.to('system').emit('health.updated', healthStats);

    } catch (err) {
      if (this.gateway.initialized) {
        logger.error(`[websocket] Error ticking system metrics: ${err.message}`);
      }
    }
  }

  /**
   * Helper to retrieve CPU usage percentage delta
   */
  getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (let i = 0, len = cpus.length; i < len; i++) {
      const cpu = cpus[i];
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    }

    const currentStats = { idle: totalIdle / cpus.length, total: totalTick / cpus.length };

    if (!this.lastCpuStats) {
      this.lastCpuStats = currentStats;
      return { percentage: '0.0', cores: cpus.length, model: cpus[0].model };
    }

    const idleDifference = currentStats.idle - this.lastCpuStats.idle;
    const totalDifference = currentStats.total - this.lastCpuStats.total;
    
    let percentage = 0;
    if (totalDifference > 0) {
      percentage = (100 - (100 * idleDifference) / totalDifference);
    }
    
    this.lastCpuStats = currentStats;

    return {
      percentage: percentage.toFixed(1),
      cores: cpus.length,
      model: cpus[0].model
    };
  }

  /**
   * Helper to calculate Disk usage metrics
   */
  async getDiskUsage() {
    try {
      // Call standard Node.js statfs on current directory '.'
      const stats = await fs.statfs('.');
      const total = stats.blocks * stats.bsize;
      const free = stats.bfree * stats.bsize;
      const used = total - free;
      return {
        total,
        free,
        used,
        percentage: ((used / total) * 100).toFixed(1)
      };
    } catch {
      // Return null fallback if statfs is unsupported on host OS or permissions fail
      return null;
    }
  }

  /**
   * Stop periodic timers and clean logger reference
   */
  stop() {
    this.stopSystemMetrics();
    if (this.botManager?.eventBus) {
      if (this.wildcardListener) {
        this.botManager.eventBus.off('*', this.wildcardListener);
        this.wildcardListener = null;
      }
      if (this.authLogoutListener) {
        this.botManager.eventBus.off('auth.logout', this.authLogoutListener);
        this.authLogoutListener = null;
      }
      if (this.authLogoutAllListener) {
        this.botManager.eventBus.off('auth.logout_all', this.authLogoutAllListener);
        this.authLogoutAllListener = null;
      }
    }
    if (logger.onLog) {
      logger.onLog = null;
    }
  }

  stopSystemMetrics() {
    if (this.sysInterval) {
      clearInterval(this.sysInterval);
      this.sysInterval = null;
    }
  }
}
