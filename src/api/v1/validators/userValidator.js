import { body, param } from 'express-validator';

const VALID_ROLES = ['owner', 'admin', 'operator', 'viewer', 'developer'];

export const createUserValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username wajib diisi')
    .isLength({ min: 3, max: 32 }).withMessage('Username 3-32 karakter')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username hanya boleh huruf, angka, - dan _'),
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('role')
    .optional()
    .isIn(VALID_ROLES).withMessage(`Role harus salah satu: ${VALID_ROLES.join(', ')}`),
  body('email')
    .optional()
    .isEmail().withMessage('Format email tidak valid'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 64 }).withMessage('Display name maksimal 64 karakter')
];

export const updateUserValidator = [
  param('id').notEmpty().withMessage('User ID wajib diisi'),
  body('role')
    .optional()
    .isIn(VALID_ROLES).withMessage(`Role harus salah satu: ${VALID_ROLES.join(', ')}`),
  body('email')
    .optional()
    .isEmail().withMessage('Format email tidak valid'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive harus boolean'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 64 }).withMessage('Display name maksimal 64 karakter'),
  body('avatar')
    .optional()
    .trim()
    .isURL().withMessage('Avatar harus berupa URL valid atau kosong')
];

export const userIdValidator = [
  param('id').notEmpty().withMessage('User ID wajib diisi')
];

export const lockUserValidator = [
  param('id').notEmpty().withMessage('User ID wajib diisi'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage('Reason harus 1-255 karakter'),
  body('durationMinutes')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration minutes harus angka bulat positif')
];

export const resetPasswordValidator = [
  param('id').notEmpty().withMessage('User ID wajib diisi'),
  body('password')
    .notEmpty().withMessage('Password baru wajib diisi')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
];
