import { param } from 'express-validator';

export const queueJobIdValidator = [
  param('id').notEmpty().withMessage('Job ID wajib diisi')
];
