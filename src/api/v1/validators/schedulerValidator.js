import { body, param } from 'express-validator';

export const createJobValidator = [
  body('name').trim().notEmpty().withMessage('Nama job wajib diisi'),
  body('schedule').trim().notEmpty().withMessage('Schedule wajib diisi'),
  body('task').notEmpty().withMessage('Task wajib diisi'),
  body('sessionId').optional().isString(),
  body('data').optional().isObject().withMessage('Data harus berupa object')
];

export const updateJobValidator = [
  param('id').notEmpty().withMessage('Job ID wajib diisi'),
  body('name').optional().trim().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('schedule').optional().trim().notEmpty().withMessage('Schedule tidak boleh kosong'),
  body('status')
    .optional()
    .isIn(['active', 'paused', 'disabled'])
    .withMessage('Status harus: active, paused, atau disabled')
];

export const jobIdValidator = [
  param('id').notEmpty().withMessage('Job ID wajib diisi')
];
