import { body, param, validationResult } from 'express-validator';

/**
 * Middleware to check validation results and return 400 on failure.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((e) => ({
        field: e.path || e.param,
        message: e.msg
      }))
    });
  }
  next();
};

/**
 * Valid config categories
 */
const VALID_CATEGORIES = [
  'system', 'bot', 'ai', 'downloader', 'queue',
  'plugin', 'scheduler', 'security', 'notification', 'storage'
];

/**
 * Validate PUT /config/:category (bulk update)
 */
export const validateConfigUpdate = [
  param('category')
    .isString()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  handleValidation
];

/**
 * Validate PUT /config/:category/:key (set single key)
 */
export const validateConfigSet = [
  param('category')
    .isString()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  param('key')
    .isString()
    .notEmpty()
    .withMessage('Key must be a non-empty string'),
  body('value')
    .exists({ values: 'undefined' })
    .withMessage('Value field is required'),
  handleValidation
];

/**
 * Validate POST /config/import
 */
export const validateConfigImport = [
  body()
    .isObject()
    .withMessage('Request body must be a JSON object'),
  handleValidation
];

/**
 * Validate POST /config/reset
 */
export const validateConfigReset = [
  body('category')
    .optional()
    .isString()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  handleValidation
];
