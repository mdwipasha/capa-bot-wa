import { body, param } from 'express-validator';

export const createSessionValidator = [
  body('phone')
    .notEmpty().withMessage('Nomor telepon wajib diisi')
    .matches(/^\d{10,15}$/).withMessage('Nomor telepon tidak valid (10-15 digit)')
];

export const sessionIdValidator = [
  param('id').notEmpty().withMessage('Session ID wajib diisi')
];
