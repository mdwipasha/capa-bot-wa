import { param } from 'express-validator';

export const commandIdValidator = [
  param('id').notEmpty().withMessage('Command ID wajib diisi')
];
