import { ApiResponse } from '../../response/ApiResponse.js';

/**
 * ServiceController — thin delegate to ServiceManager.
 */
export class ServiceController {
  constructor(botManager) {
    this.serviceManager = botManager.serviceManager;
  }

  /**
   * GET /services
   */
  async list(req, res, next) {
    try {
      const services = this.serviceManager.getServices?.() || [];
      return ApiResponse.ok(res, services);
    } catch (err) { next(err); }
  }

  /**
   * GET /services/:name
   */
  async getByName(req, res, next) {
    try {
      const service = this.serviceManager.getService?.(req.params.name);
      if (!service) return ApiResponse.notFound(res, `Service "${req.params.name}" tidak ditemukan`);
      return ApiResponse.ok(res, service);
    } catch (err) { next(err); }
  }

  /**
   * POST /services/:name/test — Test a service connection
   */
  async test(req, res, next) {
    try {
      const result = await this.serviceManager.testService?.(req.params.name);
      return ApiResponse.ok(res, result, 'Service test berhasil');
    } catch (err) { next(err); }
  }
}
