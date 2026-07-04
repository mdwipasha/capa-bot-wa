import { ApiResponse } from '../../response/ApiResponse.js';
import { parsePagination, paginate, applySearch } from '../../response/paginate.js';

/**
 * QueueController — thin delegate to QueueManager.
 */
export class QueueController {
  constructor(botManager) {
    this.queueManager = botManager.queueManager;
  }

  /**
   * GET /queue
   * Query: queueName?, page, limit, search, status
   */
  async list(req, res, next) {
    try {
      const { page, limit, search } = parsePagination(req.query);
      const { queueName, status } = req.query;

      let jobs = [];
      if (queueName) {
        try {
          jobs = this.queueManager.getQueue(queueName);
        } catch {
          jobs = [];
        }
      } else {
        // All queues
        for (const [name] of this.queueManager.jobsList) {
          const q = this.queueManager.getQueue(name);
          jobs.push(...q);
        }
      }

      // Filter by status
      if (status) {
        jobs = jobs.filter((j) => j.status.toLowerCase() === status.toLowerCase());
      }

      jobs = applySearch(jobs, search, ['id', 'queueName', 'status']);
      const result = paginate(jobs, { page, limit });

      // Add queue stats
      const stats = this.queueManager.getStats(queueName || null);
      return ApiResponse.ok(res, { ...result, queueStats: stats });
    } catch (err) { next(err); }
  }

  /**
   * GET /queue/:id
   */
  async getById(req, res, next) {
    try {
      const job = this.queueManager.getJob(req.params.id);
      if (!job) return ApiResponse.notFound(res, `Job "${req.params.id}" tidak ditemukan`);
      return ApiResponse.ok(res, job);
    } catch (err) { next(err); }
  }

  /**
   * DELETE /queue/:id — Cancel a job
   */
  async cancel(req, res, next) {
    try {
      const job = this.queueManager.cancel(req.params.id);
      return ApiResponse.ok(res, job, 'Job berhasil dibatalkan');
    } catch (err) { next(err); }
  }

  /**
   * POST /queue/:id/retry — Retry a failed job
   */
  async retry(req, res, next) {
    try {
      const job = this.queueManager.retry(req.params.id);
      return ApiResponse.ok(res, job, 'Job berhasil dijadwalkan ulang');
    } catch (err) { next(err); }
  }

  /**
   * GET /queue/stats — Overall stats
   */
  async stats(req, res, next) {
    try {
      const stats = this.queueManager.getStats(req.query.queueName || null);
      return ApiResponse.ok(res, stats);
    } catch (err) { next(err); }
  }
}
