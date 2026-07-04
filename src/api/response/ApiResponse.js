/**
 * ApiResponse — Standard response helper
 * Format: { success, message, code, data, error, timestamp, requestId }
 */
export class ApiResponse {
  /**
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {boolean} success
   * @param {string} message
   * @param {*} data
   * @param {*} error
   */
  static send(res, statusCode, success, message, data = null, error = null) {
    const requestId = res.locals?.requestId || null;
    return res.status(statusCode).json({
      success,
      message,
      code: statusCode,
      data,
      error,
      timestamp: new Date().toISOString(),
      requestId
    });
  }

  static ok(res, data = null, message = 'OK') {
    return ApiResponse.send(res, 200, true, message, data, null);
  }

  static created(res, data = null, message = 'Created') {
    return ApiResponse.send(res, 201, true, message, data, null);
  }

  static noContent(res, message = 'No Content') {
    return ApiResponse.send(res, 204, true, message, null, null);
  }

  static badRequest(res, message = 'Bad Request', error = null) {
    return ApiResponse.send(res, 400, false, message, null, error);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return ApiResponse.send(res, 401, false, message, null, { type: 'UNAUTHORIZED' });
  }

  static forbidden(res, message = 'Forbidden') {
    return ApiResponse.send(res, 403, false, message, null, { type: 'FORBIDDEN' });
  }

  static notFound(res, message = 'Not Found') {
    return ApiResponse.send(res, 404, false, message, null, { type: 'NOT_FOUND' });
  }

  static conflict(res, message = 'Conflict') {
    return ApiResponse.send(res, 409, false, message, null, { type: 'CONFLICT' });
  }

  static tooManyRequests(res, message = 'Too Many Requests') {
    return ApiResponse.send(res, 429, false, message, null, { type: 'RATE_LIMITED' });
  }

  static serverError(res, message = 'Internal Server Error', error = null) {
    return ApiResponse.send(res, 500, false, message, null, error);
  }

  /**
   * Attach helper methods directly to res object.
   * Call this once in middleware so controllers can use res.success(), res.fail(), etc.
   * @param {import('express').Response} res
   */
  static attach(res) {
    res.success = (data, message) => ApiResponse.ok(res, data, message);
    res.created = (data, message) => ApiResponse.created(res, data, message);
    res.fail = (message, status = 400, error = null) => ApiResponse.send(res, status, false, message, null, error);
  }
}
