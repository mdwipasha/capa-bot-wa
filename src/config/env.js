import dotenv from 'dotenv';

dotenv.config();

const normalizeNumber = (value = '') => value.replace(/\D/g, '');

export const config = {
  ownerNumber: normalizeNumber(process.env.OWNER_NUMBER),
  botName: process.env.BOT_NAME || 'Modern Bot',
  prefixes: (process.env.PREFIX || '.').split(',').map((item) => item.trim()).filter(Boolean),
  port: Number(process.env.PORT || 3000),
  authMethod: ['pairing', 'qr'].includes((process.env.AUTH_METHOD || 'pairing').toLowerCase())
    ? (process.env.AUTH_METHOD || 'pairing').toLowerCase()
    : 'pairing',
  sessionPath: 'src/session',
  databasePath: 'src/database/database.json',
  cooldownMs: Number(process.env.COOLDOWN_MS || 3000),
  spamWindowMs: Number(process.env.SPAM_WINDOW_MS || 10000),
  spamMaxHits: Number(process.env.SPAM_MAX_HITS || 8),
  spamBlockHits: Number(process.env.SPAM_BLOCK_HITS || 18),
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    claudeApiKey: process.env.CLAUDE_API_KEY || ''
  },
  downloaders: {
    tikwm: 'https://www.tikwm.com/api/',
    cobalt: process.env.COBALT_API_URL || 'https://api.cobalt.tools/',
    cobaltApiKey: process.env.COBALT_API_KEY || ''
  }
};
