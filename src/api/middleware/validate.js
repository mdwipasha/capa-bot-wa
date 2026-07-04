import { validationResult } from 'express-validator';
import { ApiResponse } from '../response/ApiResponse.js';

/**
 * Validation runner middleware.
 * Place after express-validator check() chains.
 * Returns 400 with field-level errors if validation fails.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
    value: err.value
  }));

  return ApiResponse.badRequest(res, 'Validasi gagal', { fields: formatted });
}
