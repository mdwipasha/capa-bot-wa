import { body, param } from 'express-validator';

export const createBotValidator = [
  body('phone')
    .notEmpty().withMessage('Nomor telepon wajib diisi')
    .matches(/^\d{10,15}$/).withMessage('Nomor telepon tidak valid (10-15 digit)'),
  body('authMethod')
    .optional()
    .isIn(['qr', 'pairing']).withMessage("authMethod harus 'qr' atau 'pairing'")
];

export const botIdValidator = [
  param('id').notEmpty().withMessage('Bot ID wajib diisi')
];