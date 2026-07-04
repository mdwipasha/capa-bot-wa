import { EventEmitter } from 'events';
import cron from 'node-cron';
import cronParser from 'cron-parser';
import fs from 'fs-extra';
import path from 'path';
import { SchedulerError } from './BotErrors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export class SchedulerManager extends EventEmitter {
  constructor({ database, eventBus, loggerService, botManager = null } = {}) {
    super();
    this.db = database;
    this.eventBus = eventBus;
    this.logger = loggerService || logger;
    this.botManager = botManager;
    
    // Stores in-memory timers/cron-tasks per jobId: { cronTask, timeoutRef, retryTimeoutRef }
    this.activeJobs = new Map();
    
    // Registered custom task handlers: jobName -> function
    this.customTasks = new Map();
  }

  setBotManager(botManager) {
    this.botManager = botManager;
  }

  registerCustomTask(name, handler) {
    if (typeof handler !== 'function') {
      throw new SchedulerError('Handler must be a function');
    }
    this.customTasks.set(name, handler);
  }

  async init() {
    this.logger.info?.({ category: 'scheduler', message: 'Initializing Scheduler Manager...' });
    
    // Prepare DB entry
    const data = await this.db.read();
    if (!data.schedulers) {
      data.schedulers = {};
      await this.db.write();
    }

    // Restore active jobs
    const jobs = await this.getJobs();
    let restoredCount = 0;
    
    for (const job of jobs) {
      if (job.status === 'active') {
        try {
          this.scheduleInMemory(job);
          restoredCount++;
        } catch (err) {
          this.logger.error?.({ category: 'scheduler', message: `Failed to restore job "${job.name}" (${job.id}): ${err.message}` });
        }
      }
    }

    this.logger.success?.({ category: 'scheduler', message: `Scheduler Manager initialized. Restored ${restoredCount} active jobs.` });
  }

  // ─────────────────────────────────────────────
  // Scheduler Actions / Executions
  // ─────────────────────────────────────────────

  parseCronOrSchedule(schedule) {
    if (!schedule) {
      throw new SchedulerError('Schedule cannot be empty');
    }
    
    const trimmed = schedule.trim();
    const lower = trimmed.toLowerCase();
    
    if (lower === 'once' || lower === 'one-time' || lower === 'one time') {
      return { type: 'one-time', date: null }; // Will rely on job.data.runAt
    }

    // Daily: daily 12:00
    let match = trimmed.match(/^daily\s+(\d+):(\d+)$/i);
    if (match) {
      const hr = parseInt(match[1], 10);
      const min = parseInt(match[2], 10);
      return { type: 'cron', expression: `${min} ${hr} * * *` };
    }

    // Weekly: weekly 1 12:00 (1: Monday, 7: Sunday or 0: Sunday depending on node-cron)
    match = trimmed.match(/^weekly\s+(\d+)\s+(\d+):(\d+)$/i);
    if (match) {
      const day = parseInt(match[1], 10);
      const hr = parseInt(match[2], 10);
      const min = parseInt(match[3], 10);
      return { type: 'cron', expression: `${min} ${hr} * * ${day}` };
    }

    // Monthly: monthly 5 12:00 (Run on 5th day of every month)
    match = trimmed.match(/^monthly\s+(\d+)\s+(\d+):(\d+)$/i);
    if (match) {
      const date = parseInt(match[1], 10);
      const hr = parseInt(match[2], 10);
      const min = parseInt(match[3], 10);
      return { type: 'cron', expression: `${min} ${hr} ${date} * *` };
    }

    // Yearly: yearly 12 25 12:00 (Run on Dec 25th)
    match = trimmed.match(/^yearly\s+(\d+)\s+(\d+)\s+(\d+):(\d+)$/i);
    if (match) {
      const month = parseInt(match[1], 10);
      const date = parseInt(match[2], 10);
      const hr = parseInt(match[3], 10);
      const min = parseInt(match[4], 10);
      return { type: 'cron', expression: `${min} ${hr} ${date} ${month} *` };
    }

    // Standard cron expression check (e.g., 5 or 6 fields)
    const cronRegex = /^([\d\*\/,\-]+)\s+([\d\*\/,\-]+)\s+([\d\*\/,\-]+)\s+([\d\*\/,\-]+)\s+([\d\*\/,\-]+)(\s+[\d\*\/,\-]+)?$/;
    if (cronRegex.test(trimmed)) {
      return { type: 'cron', expression: trimmed };
    }

    // Try to parse as Date string
    const parsedDate = Date.parse(trimmed);
    if (!isNaN(parsedDate) && isNaN(Number(trimmed))) {
      return { type: 'one-time', date: new Date(parsedDate) };
    }

    throw new SchedulerError(`Invalid schedule format: "${schedule}"`);
  }

  calculateNextRun(cronStr, timezone = 'Asia/Jakarta') {
    try {
      const parsed = this.parseCronOrSchedule(cronStr);
      if (parsed.type === 'one-time') {
        const date = parsed.date;
        if (date && date.getTime() > Date.now()) {
          return date.toISOString();
        }
        return null;
      } else if (parsed.type === 'cron') {
        const parseFn = cronParser.parse || cronParser.default?.parse;
        if (!parseFn) throw new Error('cron-parser parse function not found');
        const interval = parseFn(parsed.expression, { tz: timezone });
        return interval.next().toDate().toISOString();
      }
    } catch (err) {
      this.logger.warn?.({ category: 'scheduler', message: `Could not calculate next run for "${cronStr}": ${err.message}` });
    }
    return null;
  }

  scheduleInMemory(job) {
    const id = job.id;
    
    // Duplicate Prevention: stop existing in-memory job schedules before registering
    this.cancelInMemory(id);

    if (job.status !== 'active') return;

    let parsed;
    try {
      parsed = this.parseCronOrSchedule(job.cron);
    } catch (err) {
      this.logger.error?.({ category: 'scheduler', message: `Invalid cron config for job "${job.name}": ${err.message}` });
      return;
    }

    if (parsed.type === 'one-time') {
      const runAt = parsed.date || (job.data?.runAt ? new Date(job.data.runAt) : null);
      if (!runAt) {
        this.logger.warn?.({ category: 'scheduler', message: `One Time job "${job.name}" has no valid execution date` });
        return;
      }
      
      const delay = runAt.getTime() - Date.now();
      if (delay <= 0) {
        // If past, run it immediately or mark completed
        this.logger.info?.({ category: 'scheduler', message: `One Time job "${job.name}" (${job.id}) was scheduled in past. Executing now.` });
        this.runJob(id, false);
      } else {
        const timeoutRef = setTimeout(() => {
          this.runJob(id, false);
        }, delay);
        this.activeJobs.set(id, { timeoutRef });
      }
    } else if (parsed.type === 'cron') {
      const cronTask = cron.schedule(parsed.expression, () => {
        this.runJob(id, false);
      }, {
        scheduled: true,
        timezone: job.timezone || 'Asia/Jakarta'
      });
      this.activeJobs.set(id, { cronTask });
    }
  }

  cancelInMemory(id) {
    const active = this.activeJobs.get(id);
    if (active) {
      if (active.cronTask) {
        active.cronTask.stop();
      }
      if (active.timeoutRef) {
        clearTimeout(active.timeoutRef);
      }
      if (active.retryTimeoutRef) {
        clearTimeout(active.retryTimeoutRef);
      }
      this.activeJobs.delete(id);
    }
  }

  async runJob(id, isManual = false) {
    const job = await this.getJob(id);
    if (!job) return;
    if (!isManual && job.status !== 'active') return;

    this.logger.info?.({ category: 'scheduler', message: `Starting job "${job.name}" (${job.id}) [Type: ${job.jobType}]` });
    
    // Emit job.started event
    const startPayload = { id: job.id, name: job.name, jobType: job.jobType, isManual };
    this.emit('job.started', startPayload);
    if (this.eventBus) {
      this.eventBus.emitEvent('job.started', startPayload);
    }

    const startTime = Date.now();
    try {
      // Execute the job payload
      await this.executeJobAction(job);

      const duration = Date.now() - startTime;
      this.logger.success?.({ category: 'scheduler', message: `Job "${job.name}" completed successfully in ${duration}ms` });

      // Determine new status for one-time job
      let nextStatus = job.status;
      const parsed = this.parseCronOrSchedule(job.cron);
      if (parsed.type === 'one-time') {
        nextStatus = 'completed';
      }

      await this.updateJobFields(id, {
        lastRun: new Date().toISOString(),
        retryCount: 0,
        status: nextStatus,
        nextRun: this.calculateNextRun(job.cron, job.timezone)
      });

      const updatedJob = await this.getJob(id);
      const finishedPayload = { id: job.id, name: job.name, duration, job: updatedJob };
      this.emit('job.finished', finishedPayload);
      if (this.eventBus) {
        this.eventBus.emitEvent('job.finished', finishedPayload);
      }
      
      // Reschedule or clean up in-memory
      if (nextStatus === 'completed') {
        this.cancelInMemory(id);
      } else {
        // Just refresh schedule to recalculate next run
        this.scheduleInMemory(updatedJob);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error?.({ category: 'scheduler', message: `Job "${job.name}" failed: ${error.message}` });
      
      await this.handleJobFailure(id, job, error);
    }
  }

  async handleJobFailure(id, job, error) {
    const nextRetryCount = (job.retryCount || 0) + 1;
    const maxRetry = typeof job.maxRetry === 'number' ? job.maxRetry : 3;
    const isRetryEnabled = job.retry !== false && nextRetryCount <= maxRetry;

    if (isRetryEnabled) {
      this.logger.warn?.({ category: 'scheduler', message: `Retrying job "${job.name}" (Attempt ${nextRetryCount}/${maxRetry})` });
      
      await this.updateJobFields(id, {
        retryCount: nextRetryCount
      });

      const retryDelay = 5000 * nextRetryCount;
      const active = this.activeJobs.get(id) || {};
      if (active.retryTimeoutRef) {
        clearTimeout(active.retryTimeoutRef);
      }
      
      active.retryTimeoutRef = setTimeout(() => {
        this.runJob(id, false);
      }, retryDelay);
      
      this.activeJobs.set(id, active);
    } else {
      // Retries exhausted
      this.logger.error?.({ category: 'scheduler', message: `Job "${job.name}" failed. Retries exhausted.` });
      
      let nextStatus = job.status;
      const parsed = this.parseCronOrSchedule(job.cron);
      if (parsed.type === 'one-time') {
        nextStatus = 'failed';
      }

      await this.updateJobFields(id, {
        retryCount: 0, // Reset for future intervals
        status: nextStatus,
        nextRun: this.calculateNextRun(job.cron, job.timezone)
      });

      const updatedJob = await this.getJob(id);
      const failedPayload = { id: job.id, name: job.name, error: error.message, job: updatedJob };
      
      this.emit('job.failed', failedPayload);
      if (this.eventBus) {
        this.eventBus.emitEvent('job.failed', failedPayload);
      }

      if (nextStatus === 'failed') {
        this.cancelInMemory(id);
      } else {
        this.scheduleInMemory(updatedJob);
      }
    }
  }

  async executeJobAction(job) {
    const type = job.jobType.toLowerCase().replace(/_/g, ' ');
    
    switch (type) {
      case 'broadcast': {
        if (!this.botManager) throw new Error('BotManager is not available');
        const text = job.data?.message || job.data?.text;
        if (!text) throw new Error('Broadcast message text is empty');
        
        await this.botManager.broadcast({
          sessionId: job.createdBy,
          message: text,
          ...job.data
        });
        break;
      }
      
      case 'reminder': {
        const text = job.data?.message || job.data?.text;
        const target = job.data?.target || job.data?.jid;
        if (!text) throw new Error('Reminder message is empty');
        if (!target) throw new Error('Reminder target JID is empty');

        const bot = this.botManager?.getBot(job.createdBy) || this.botManager?.getBots()?.[0];
        if (!bot || !bot.sock) {
          throw new Error('No active bot session available for sending reminder');
        }

        await bot.sock.sendMessage(target, { text });
        break;
      }

      case 'auto backup': {
        if (this.botManager?.queueManager) {
          const qJob = this.botManager.queueManager.enqueue('Upload Queue', {
            type: 'auto-backup',
            databasePath: config.databasePath
          }, {
            priority: 5,
            preventDuplicate: true
          });
          this.logger.info?.({ category: 'scheduler', message: `Auto backup task enqueued to Upload Queue (Job ID: ${qJob.id})` });
        } else {
          const stamp = new Date().toISOString().replace(/[:.]/g, '-');
          await fs.ensureDir('backups');
          const backupFile = `backups/database-${stamp}.json`;
          await fs.copy(config.databasePath, backupFile);
          this.logger.success?.({ category: 'scheduler', message: `Auto backup database saved to: ${backupFile} (fallback)` });
        }
        break;
      }

      case 'auto restart': {
        this.logger.warn?.({ category: 'scheduler', message: 'Auto Restart job triggered. Terminating process...' });
        setTimeout(() => process.exit(0), 1000);
        break;
      }

      case 'plugin task': {
        const commandName = job.data?.commandName || job.data?.pluginName;
        const args = job.data?.args || [];
        const targetJid = job.data?.targetJid || job.data?.jid || (config.ownerNumber ? `${config.ownerNumber}@s.whatsapp.net` : null);
        
        if (!commandName) throw new Error('Plugin task commandName is missing');
        if (!targetJid) throw new Error('Plugin task targetJid is missing and owner number not configured');

        const bot = this.botManager?.getBot(job.createdBy) || this.botManager?.getBots()?.[0];
        if (!bot || !bot.sock) {
          throw new Error('No active bot session available to execute plugin task');
        }

        const command = this.botManager?.commandManager?.registry?.get(commandName);
        if (!command) {
          throw new Error(`Command "${commandName}" not found in registry`);
        }

        const mockMsg = {
          key: {
            remoteJid: targetJid,
            fromMe: true,
            id: `sched-${job.id}-${Date.now()}`
          },
          message: {
            conversation: `${config.prefixes[0] || '.'}${commandName} ${args.join(' ')}`
          },
          messageTimestamp: Math.floor(Date.now() / 1000)
        };

        await command.execute({
          sock: bot.sock,
          msg: mockMsg,
          args,
          db: this.db,
          botManager: this.botManager
        });
        break;
      }

      case 'cleanup': {
        const downloadsDir = 'downloads';
        if (await fs.exists(downloadsDir)) {
          const files = await fs.readdir(downloadsDir);
          let deletedCount = 0;
          for (const file of files) {
            if (file !== '.gitkeep') {
              await fs.remove(path.join(downloadsDir, file)).catch(() => {});
              deletedCount++;
            }
          }
          this.logger.success?.({ category: 'scheduler', message: `Cleanup complete. Deleted ${deletedCount} files in downloads/` });
        }
        break;
      }

      case 'custom task': {
        if (job.data?.code) {
          const fn = new Function('botManager', 'db', 'job', `
            return (async () => {
              ${job.data.code}
            })();
          `);
          await fn(this.botManager, this.db, job);
        } else if (this.customTasks.has(job.name)) {
          const handler = this.customTasks.get(job.name);
          await handler(job);
        } else {
          throw new Error(`Custom Task "${job.name}" has no registered handler or JavaScript code`);
        }
        break;
      }

      default: {
        throw new Error(`Unsupported Job Type: ${job.jobType}`);
      }
    }
  }

  // ─────────────────────────────────────────────
  // CRUD APIs & Database Persistence
  // ─────────────────────────────────────────────

  async createJob(jobData) {
    if (!jobData.name) {
      throw new SchedulerError('Job name is required');
    }
    if (!jobData.jobType) {
      throw new SchedulerError('Job jobType is required');
    }
    if (!jobData.cron) {
      throw new SchedulerError('Job schedule/cron expression is required');
    }

    const data = await this.db.read();
    
    // Duplicate Prevention (Check name and ID)
    const existingJobs = Object.values(data.schedulers || {});
    if (existingJobs.some((j) => j.name === jobData.name)) {
      throw new SchedulerError(`Duplicate Prevention: A job named "${jobData.name}" already exists`);
    }

    const id = jobData.id || `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    if (data.schedulers[id]) {
      throw new SchedulerError(`Duplicate Prevention: A job with ID "${id}" already exists`);
    }

    const now = new Date().toISOString();
    const timezone = jobData.timezone || 'Asia/Jakarta';
    
    const job = {
      id,
      name: jobData.name,
      description: jobData.description || '',
      createdBy: jobData.createdBy || 'system',
      createdAt: now,
      updatedAt: now,
      timezone,
      cron: jobData.cron,
      status: jobData.status || 'active',
      lastRun: null,
      nextRun: this.calculateNextRun(jobData.cron, timezone),
      retry: jobData.retry !== false,
      retryCount: 0,
      maxRetry: typeof jobData.maxRetry === 'number' ? jobData.maxRetry : 3,
      jobType: jobData.jobType,
      data: jobData.data || {}
    };

    data.schedulers[id] = job;
    await this.db.write();

    this.scheduleInMemory(job);

    const payload = { id: job.id, name: job.name, job };
    this.emit('job.created', payload);
    if (this.eventBus) {
      this.eventBus.emitEvent('job.created', payload);
    }

    return job;
  }

  async updateJob(id, updateData) {
    const data = await this.db.read();
    const job = data.schedulers[id];
    if (!job) {
      throw new SchedulerError(`Job "${id}" not found`);
    }

    // Check duplicate name if name is updated
    if (updateData.name && updateData.name !== job.name) {
      const existingJobs = Object.values(data.schedulers);
      if (existingJobs.some((j) => j.name === updateData.name && j.id !== id)) {
        throw new SchedulerError(`Duplicate Prevention: A job named "${updateData.name}" already exists`);
      }
    }

    const updatedJob = {
      ...job,
      ...updateData,
      id, // ensure ID is never changed
      updatedAt: new Date().toISOString()
    };

    // Recompute next run if schedule/timezone changed
    if (updateData.cron !== undefined || updateData.timezone !== undefined) {
      updatedJob.nextRun = this.calculateNextRun(updatedJob.cron, updatedJob.timezone);
    }

    data.schedulers[id] = updatedJob;
    await this.db.write();

    // Cancel existing memory structures and reschedule
    this.cancelInMemory(id);
    if (updatedJob.status === 'active') {
      this.scheduleInMemory(updatedJob);
    }

    return updatedJob;
  }

  async deleteJob(id) {
    const data = await this.db.read();
    const job = data.schedulers[id];
    if (!job) {
      throw new SchedulerError(`Job "${id}" not found`);
    }

    this.cancelInMemory(id);
    delete data.schedulers[id];
    await this.db.write();

    const payload = { id, name: job.name };
    this.emit('job.deleted', payload);
    if (this.eventBus) {
      this.eventBus.emitEvent('job.deleted', payload);
    }

    return job;
  }

  async pauseJob(id) {
    const job = await this.updateJob(id, { status: 'paused', nextRun: null });
    this.cancelInMemory(id);

    const payload = { id, name: job.name, job };
    this.emit('job.paused', payload);
    if (this.eventBus) {
      this.eventBus.emitEvent('job.paused', payload);
    }

    return job;
  }

  async resumeJob(id) {
    const data = await this.db.read();
    const currentJob = data.schedulers[id];
    if (!currentJob) throw new SchedulerError(`Job "${id}" not found`);

    const nextRun = this.calculateNextRun(currentJob.cron, currentJob.timezone);
    const job = await this.updateJob(id, { status: 'active', nextRun });
    this.scheduleInMemory(job);

    const payload = { id, name: job.name, job };
    this.emit('job.resumed', payload);
    if (this.eventBus) {
      this.eventBus.emitEvent('job.resumed', payload);
    }

    return job;
  }

  async cancelJob(id) {
    // Stops execution schedule and sets status to 'cancelled'
    const job = await this.updateJob(id, { status: 'cancelled', nextRun: null });
    this.cancelInMemory(id);

    const payload = { id, name: job.name, job };
    this.emit('job.paused', payload); // cancel shares similar downstream events to pause/stop
    if (this.eventBus) {
      this.eventBus.emitEvent('job.paused', payload);
    }

    return job;
  }

  async runNow(id) {
    const job = await this.getJob(id);
    if (!job) throw new SchedulerError(`Job "${id}" not found`);
    
    // Executes job in background asynchronously
    this.runJob(id, true).catch((err) => {
      this.logger.error?.({ category: 'scheduler', message: `Manual trigger runNow for "${job.name}" failed: ${err.message}` });
    });
    
    return job;
  }

  async getJobs() {
    const data = await this.db.read();
    return Object.values(data.schedulers || {});
  }

  async getJob(id) {
    const data = await this.db.read();
    return data.schedulers?.[id] || null;
  }

  // Internal helper to update database fields directly without full reschedule cycle
  async updateJobFields(id, fields) {
    const data = await this.db.read();
    if (data.schedulers[id]) {
      data.schedulers[id] = {
        ...data.schedulers[id],
        ...fields,
        updatedAt: new Date().toISOString()
      };
      await this.db.write();
    }
  }
}
