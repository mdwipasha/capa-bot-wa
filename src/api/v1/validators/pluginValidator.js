import { body, param } from 'express-validator';

export const pluginIdValidator = [
  param('id').notEmpty().withMessage('Plugin ID wajib diisi')
];

export const installPluginValidator = [
  body('name').trim().notEmpty().withMessage('Nama plugin wajib diisi'),
  body('source').optional().isURL().withMessage('Source harus berupa URL yang valid')
];
