import { body, param } from 'express-validator';

const VALID_ROLES = ['owner', 'admin', 'moderator', 'viewer', 'developer'];

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
    .isEmail().withMessage('Format email tidak valid')
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
    .isBoolean().withMessage('isActive harus boolean')
];

export const userIdValidator = [
  param('id').notEmpty().withMessage('User ID wajib diisi')
];
