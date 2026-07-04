import { body } from 'express-validator';

export const loginValidator = [
  body('username').trim().notEmpty().withMessage('Username wajib diisi'),
  body('password').notEmpty().withMessage('Password wajib diisi')
];

export const refreshValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token wajib diisi')
];

export const changePasswordValidator = [
  body('oldPassword').notEmpty().withMessage('Password lama wajib diisi'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password baru minimal 6 karakter')
];
