import { EventEmitter } from 'events';
import { QueueError } from './BotErrors.js';
import { logger } from '../utils/logger.js';

export class QueueManager extends EventEmitter {
  constructor({ loggerService } = {}) {
    super();
    this.logger = loggerService || logger;
    
    // Mapping of queueName -> array of jobs
    this.jobsList = new Map();
    
    // Mapping of queueName -> worker configuration { workerFn, concurrency, paused }
    this.workers = new Map();
    
    // Mapping of queueName -> array of completed durations (for average calculation)
    this.durations = new Map();

    // Initialize all supported queue structures
    const validQueues = [
      'Broadcast Queue',
      'Message Queue',
      'Download Queue',
      'Sticker Queue',
      'Video Queue',
      'Image Queue',
      'AI Queue',
      'OCR Queue',
      'Upload Queue'
    ];
    
    for (const q of validQueues) {
      this.jobsList.set(q, []);
      this.durations.set(q, []);
    }
  }

  normalizeQueueName(name) {
    if (!name) return 'Message Queue';
    const validQueues = [
      'Broadcast Queue',
      'Message Queue',
      'Download Queue',
      'Sticker Queue',
      'Video Queue',
      'Image Queue',
      'AI Queue',
      'OCR Queue',
      'Upload Queue'
    ];
    const normalized = validQueues.find(
      (q) => q.toLowerCase() === name.toLowerCase() || 
             q.toLowerCase().replace(' queue', '') === name.toLowerCase()
    );
    if (!normalized) {
      throw new QueueError(`Invalid queue name: "${name}"`);
    }
    return normalized;
  }

  registerWorker(queueName, workerFn, options = {}) {
    const normalized = this.normalizeQueueName(queueName);
    if (typeof workerFn !== 'function') {
      throw new QueueError('Worker handler must be a function');
    }
    
    const existing = this.workers.get(normalized) || {};
    this.workers.set(normalized, {
      workerFn,
      concurrency: options.concurrency || 1,
      paused: existing.paused || false
    });

    this.logger.info?.({ category: 'queue', message: `Worker registered for "${normalized}" (concurrency: ${options.concurrency || 1})` });
    
    // Start processing queue in case there are waiting jobs
    process.nextTick(() => this.processQueue(normalized));
  }

  enqueue(queueName, jobData, options = {}) {
    const normalized = this.normalizeQueueName(queueName);
    const id = options.id || `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Duplicate Prevention
    if (options.preventDuplicate !== false) {
      const activeJobs = this.jobsList.get(normalized) || [];
      const duplicate = activeJobs.find((job) => {
        if (job.id === id) return true;
        if (options.deduplicationKey && job.data?.[options.deduplicationKey] === jobData?.[options.deduplicationKey]) {
          return ['Waiting', 'Running', 'Paused', 'Retrying'].includes(job.status);
        }
        return false;
      });
      if (duplicate) {
        this.logger.warn?.({ category: 'queue', message: `Duplicate job skipped for "${normalized}" (ID: ${duplicate.id})` });
        return duplicate;
      }
    }

    const job = {
      id,
      queueName: normalized,
      data: jobData,
      priority: typeof options.priority === 'number' ? options.priority : 0,
      status: 'Waiting',
      progress: 0,
      retryCount: 0,
      maxRetry: typeof options.maxRetry === 'number' ? options.maxRetry : 3,
      timeout: typeof options.timeout === 'number' ? options.timeout : 30000,
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
      error: null,
      result: null
    };

    this.jobsList.get(normalized).push(job);
    
    this.emit('queue.created', { queueName: normalized, job });
    
    // Trigger queue processing loop
    process.nextTick(() => this.processQueue(normalized));

    return job;
  }

  async processQueue(queueName) {
    const normalized = this.normalizeQueueName(queueName);
    const worker = this.workers.get(normalized);
    if (!worker || worker.paused) return;

    const jobs = this.jobsList.get(normalized) || [];
    const runningJobs = jobs.filter((j) => j.status === 'Running').length;
    const availableSlots = worker.concurrency - runningJobs;

    if (availableSlots <= 0) return;

    // Get next jobs: sort by priority (descending) and then creation time (ascending)
    const nextJobs = jobs
      .filter((j) => ['Waiting', 'Retrying'].includes(j.status))
      .sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    const jobsToStart = nextJobs.slice(0, availableSlots);
    for (const job of jobsToStart) {
      this.runJob(job, worker.workerFn);
    }
  }

  async runJob(job, workerFn) {
    job.status = 'Running';
    job.startedAt = new Date().toISOString();
    
    this.emit('queue.started', { queueName: job.queueName, job });

    let timedOut = false;
    let timeoutTimer;

    if (job.timeout > 0) {
      timeoutTimer = setTimeout(() => {
        timedOut = true;
        this.handleJobTimeout(job);
      }, job.timeout);
    }

    try {
      const updateProgress = (percentage) => {
        job.progress = Math.min(100, Math.max(0, Math.round(percentage)));
      };

      const result = await workerFn(job, updateProgress);
      
      if (timedOut) return;
      if (timeoutTimer) clearTimeout(timeoutTimer);

      job.status = 'Completed';
      job.progress = 100;
      job.finishedAt = new Date().toISOString();
      job.result = result;

      // Track duration for stats
      const duration = new Date(job.finishedAt) - new Date(job.startedAt);
      const durs = this.durations.get(job.queueName) || [];
      durs.push(duration);
      if (durs.length > 500) durs.shift(); // keep last 500 execution metrics

      this.emit('queue.finished', { queueName: job.queueName, job, result });
    } catch (err) {
      if (timedOut) return;
      if (timeoutTimer) clearTimeout(timeoutTimer);

      job.error = err.message;
      this.handleJobFailure(job, err, workerFn);
    } finally {
      // Loop next jobs on this queue
      process.nextTick(() => this.processQueue(job.queueName));
    }
  }

  handleJobTimeout(job) {
    job.status = 'Failed';
    job.error = `Job timed out after ${job.timeout}ms`;
    job.finishedAt = new Date().toISOString();

    this.emit('queue.failed', { queueName: job.queueName, job, error: job.error });
    
    process.nextTick(() => this.processQueue(job.queueName));
  }

  handleJobFailure(job, error, workerFn) {
    if (job.status === 'Cancelled') return;

    const nextRetryCount = job.retryCount + 1;
    if (nextRetryCount <= job.maxRetry) {
      job.retryCount = nextRetryCount;
      job.status = 'Retrying';
      
      this.logger.warn?.({ category: 'queue', message: `Retrying job "${job.id}" in "${job.queueName}" (Attempt ${nextRetryCount}/${job.maxRetry})` });

      const delay = 1000 * Math.pow(2, nextRetryCount);
      setTimeout(() => {
        if (job.status === 'Retrying') {
          this.runJob(job, workerFn);
        }
      }, delay);
    } else {
      job.status = 'Failed';
      job.finishedAt = new Date().toISOString();
      this.emit('queue.failed', { queueName: job.queueName, job, error: error.message });
    }
  }

  cancel(jobId) {
    const job = this.getJob(jobId);
    if (!job) {
      throw new QueueError(`Job "${jobId}" not found`);
    }

    if (['Completed', 'Failed', 'Cancelled'].includes(job.status)) {
      return job;
    }

    job.status = 'Cancelled';
    job.finishedAt = new Date().toISOString();
    
    this.emit('queue.cancelled', { queueName: job.queueName, job });

    process.nextTick(() => this.processQueue(job.queueName));
    return job;
  }

  pause(queueName) {
    if (!queueName) {
      for (const [name, worker] of this.workers.entries()) {
        worker.paused = true;
      }
    } else {
      const normalized = this.normalizeQueueName(queueName);
      const worker = this.workers.get(normalized);
      if (worker) {
        worker.paused = true;
      } else {
        this.workers.set(normalized, { workerFn: null, concurrency: 1, paused: true });
      }
    }
    this.logger.info?.({ category: 'queue', message: `Queue paused: ${queueName || 'all'}` });
  }

  resume(queueName) {
    if (!queueName) {
      for (const [name, worker] of this.workers.entries()) {
        worker.paused = false;
        process.nextTick(() => this.processQueue(name));
      }
    } else {
      const normalized = this.normalizeQueueName(queueName);
      const worker = this.workers.get(normalized);
      if (worker) {
        worker.paused = false;
        process.nextTick(() => this.processQueue(normalized));
      }
    }
    this.logger.info?.({ category: 'queue', message: `Queue resumed: ${queueName || 'all'}` });
  }

  retry(jobId) {
    const job = this.getJob(jobId);
    if (!job) {
      throw new QueueError(`Job "${jobId}" not found`);
    }

    if (!['Failed', 'Cancelled'].includes(job.status)) {
      throw new QueueError(`Cannot retry job in status: "${job.status}"`);
    }

    job.status = 'Waiting';
    job.retryCount = 0;
    job.progress = 0;
    job.startedAt = null;
    job.finishedAt = null;
    job.error = null;
    job.result = null;

    const worker = this.workers.get(job.queueName);
    if (worker) {
      process.nextTick(() => this.processQueue(job.queueName));
    }
    return job;
  }

  clear(queueName) {
    if (!queueName) {
      for (const name of this.jobsList.keys()) {
        this.clear(name);
      }
      return;
    }
    const normalized = this.normalizeQueueName(queueName);
    const jobs = this.jobsList.get(normalized) || [];
    // Retain only currently running jobs
    const runningJobs = jobs.filter((j) => j.status === 'Running');
    this.jobsList.set(normalized, runningJobs);
    this.logger.info?.({ category: 'queue', message: `Queue "${normalized}" cleared (retained ${runningJobs.length} running jobs)` });
  }

  getQueue(queueName) {
    const normalized = this.normalizeQueueName(queueName);
    return this.jobsList.get(normalized) || [];
  }

  getJob(jobId) {
    for (const jobs of this.jobsList.values()) {
      const job = jobs.find((j) => j.id === jobId);
      if (job) return job;
    }
    return null;
  }

  getStats(queueName = null) {
    const stats = {
      Waiting: 0,
      Running: 0,
      Completed: 0,
      Failed: 0,
      Retry: 0,
      AverageTime: 0
    };

    let totalDurations = [];
    const countJob = (job) => {
      if (job.status === 'Waiting') stats.Waiting++;
      else if (job.status === 'Running') stats.Running++;
      else if (job.status === 'Completed') stats.Completed++;
      else if (job.status === 'Failed') stats.Failed++;
      else if (job.status === 'Retrying') stats.Retry++;
      
      stats.Retry += job.retryCount;
    };

    if (queueName) {
      const normalized = this.normalizeQueueName(queueName);
      const jobs = this.jobsList.get(normalized) || [];
      jobs.forEach(countJob);
      totalDurations = this.durations.get(normalized) || [];
    } else {
      for (const jobs of this.jobsList.values()) {
        jobs.forEach(countJob);
      }
      for (const durs of this.durations.values()) {
        totalDurations = totalDurations.concat(durs);
      }
    }

    if (totalDurations.length > 0) {
      const sum = totalDurations.reduce((acc, val) => acc + val, 0);
      stats.AverageTime = Math.round(sum / totalDurations.length);
    }

    return stats;
  }
}
