import { body } from 'express-validator';

export const sendMessageValidator = [
  body('sessionId').optional().isString().withMessage('sessionId harus string'),
  body('phone')
    .if(body('jid').not().exists())
    .notEmpty().withMessage('phone atau jid wajib diisi')
    .matches(/^\d{10,15}$/).withMessage('Nomor telepon tidak valid'),
  body('message').notEmpty().withMessage('Pesan wajib diisi')
];

export const broadcastValidator = [
  body('message').notEmpty().withMessage('Pesan broadcast wajib diisi'),
  body('target')
    .optional()
    .isIn(['chats', 'groups', 'users'])
    .withMessage('Target harus: chats, groups, atau users'),
  body('concurrency')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Concurrency antara 1-10'),
  body('delayMs')
    .optional()
    .isInt({ min: 0, max: 30000 })
    .withMessage('Delay antara 0-30000ms')
];

export const replyValidator = [
  body('sessionId').notEmpty().withMessage('sessionId wajib diisi'),
  body('jid').notEmpty().withMessage('jid wajib diisi'),
  body('message').notEmpty().withMessage('Pesan wajib diisi'),
  body('quotedMessageId').optional().isString()
];
