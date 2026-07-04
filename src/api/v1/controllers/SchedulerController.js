import { ApiResponse } from '../../response/ApiResponse.js';
import { parsePagination, paginate, applySearch, applySort } from '../../response/paginate.js';

/**
 * SchedulerController — thin delegate to SchedulerManager.
 */
export class SchedulerController {
  constructor(botManager) {
    this.schedulerManager = botManager.schedulerManager;
  }

  /**
   * GET /jobs
   */
  async list(req, res, next) {
    try {
      const { page, limit, sort, order, search } = parsePagination(req.query);
      let jobs = await this.schedulerManager.getJobs();
      jobs = applySearch(jobs, search, ['name', 'id', 'task', 'status', 'schedule']);
      jobs = applySort(jobs, sort, order);
      const result = paginate(jobs, { page, limit });
      return ApiResponse.ok(res, result);
    } catch (err) { next(err); }
  }

  /**
   * POST /jobs
   * body: { name, schedule, task, sessionId?, data?, timezone?, maxRuns? }
   */
  async create(req, res, next) {
    try {
      const job = await this.schedulerManager.createJob(req.body);
      return ApiResponse.created(res, job, 'Job berhasil dibuat');
    } catch (err) { next(err); }
  }

  /**
   * PATCH /jobs/:id
   * body: { name?, schedule?, status?, data? }
   */
  async update(req, res, next) {
    try {
      const job = await this.schedulerManager.updateJob(req.params.id, req.body);
      return ApiResponse.ok(res, job, 'Job berhasil diperbarui');
    } catch (err) { next(err); }
  }

  /**
   * DELETE /jobs/:id
   */
  async remove(req, res, next) {
    try {
      const result = await this.schedulerManager.deleteJob(req.params.id);
      return ApiResponse.ok(res, result, 'Job berhasil dihapus');
    } catch (err) { next(err); }
  }

  /**
   * POST /jobs/:id/run — Trigger job immediately
   */
  async run(req, res, next) {
    try {
      const result = await this.schedulerManager.runJobNow(req.params.id);
      return ApiResponse.ok(res, result, 'Job berhasil dijalankan');
    } catch (err) { next(err); }
  }

  /**
   * GET /jobs/:id
   */
  async getById(req, res, next) {
    try {
      const job = await this.schedulerManager.getJob(req.params.id);
      if (!job) return ApiResponse.notFound(res, `Job "${req.params.id}" tidak ditemukan`);
      return ApiResponse.ok(res, job);
    } catch (err) { next(err); }
  }
}
