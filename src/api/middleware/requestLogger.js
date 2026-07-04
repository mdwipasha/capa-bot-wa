import { logger } from '../../utils/logger.js';
import { UserModel } from '../../models/UserModel.js';

/**
 * requestLogger middleware — logs and audits every API request.
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      statusCode: res.statusCode,
      ip: req.ip || req.connection?.remoteAddress,
      userId: req.user?.id || null,
      userRole: req.user?.role || null,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'] || ''
    };

    logger.info?.({ category: 'api', ...logEntry });

    // Persist audit log asynchronously (fire-and-forget)
    UserModel.auditLog(logEntry).catch(() => {});
  });

  next();
}
