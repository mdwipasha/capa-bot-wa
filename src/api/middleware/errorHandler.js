import { ApiResponse } from '../response/ApiResponse.js';
import { logger } from '../../utils/logger.js';

/**
 * Central error handler middleware.
 * Must be registered LAST in Express app.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const requestId = req.requestId || res.locals?.requestId;

  // Known operational errors
  if (err.isOperational || err.statusCode) {
    const status = err.statusCode || err.status || 400;
    return ApiResponse.send(
      res, status, false,
      err.message || 'Request Error',
      null,
      { type: err.code || 'REQUEST_ERROR', requestId }
    );
  }

  // JWT errors (should have been caught in auth middleware, but just in case)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, err.message);
  }

  // Validation errors from express-validator (if not caught by validate middleware)
  if (err.name === 'ValidationError') {
    return ApiResponse.badRequest(res, err.message);
  }

  // CORS errors
  if (err.message?.includes('CORS')) {
    return ApiResponse.forbidden(res, err.message);
  }

  // SyntaxError (malformed JSON body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ApiResponse.badRequest(res, 'JSON body tidak valid');
  }

  // Unknown / unexpected errors
  logger.error?.(`Unhandled error: ${err.message}`, {
    category: 'api',
    requestId,
    stack: err.stack
  });

  return ApiResponse.serverError(
    res,
    'Terjadi kesalahan internal server',
    process.env.NODE_ENV === 'development'
      ? { message: err.message, stack: err.stack, requestId }
      : { requestId }
  );
}

/**
 * 404 handler — must be registered after all routes.
 */
export function notFoundHandler(req, res) {
  return ApiResponse.notFound(
    res,
    `Endpoint "${req.method} ${req.originalUrl}" tidak ditemukan`
  );
}
