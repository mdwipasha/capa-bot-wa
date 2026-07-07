import dotenv from 'dotenv';

dotenv.config();

const normalizeNumber = (value = '') => value.replace(/\D/g, '');

export const config = {
  ownerNumber: normalizeNumber(process.env.OWNER_NUMBER),
  botName: process.env.BOT_NAME || 'Modern Bot',
  prefixes: (process.env.PREFIX || '.').split(',').map((item) => item.trim()).filter(Boolean),
  port: Number(process.env.PORT || 3000),
  apiPort: Number(process.env.API_PORT || 3001),
  jwtSecret: process.env.JWT_SECRET || 'secret-wabot-key-123-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-wabot-key-123-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  apiRateLimitGlobal: Number(process.env.API_RATE_LIMIT_GLOBAL || 200),
  apiRateLimitAuth: Number(process.env.API_RATE_LIMIT_AUTH || 10),
  apiRateLimitMessage: Number(process.env.API_RATE_LIMIT_MESSAGE || 60),
  apiRateLimitApiKey: Number(process.env.API_RATE_LIMIT_API_KEY || 1000),
  corsOrigins: (process.env.CORS_ORIGINS || '*').split(',').map((item) => item.trim()).filter(Boolean),
  authMethod: ['pairing', 'qr'].includes((process.env.AUTH_METHOD || 'pairing').toLowerCase())
    ? (process.env.AUTH_METHOD || 'pairing').toLowerCase()
    : 'pairing',
  sessionPath: process.env.SESSION_PATH || 'src/session',
  sessionBasePath: process.env.SESSION_BASE_PATH || 'sessions',
  logLevel: (process.env.LOG_LEVEL || 'info').toLowerCase(),
  maxSession: Number(process.env.MAX_SESSION || 50),
  reconnect: {
    maxAttempts: Number(process.env.RECONNECT_MAX_ATTEMPTS || 5),
    baseDelayMs: Number(process.env.RECONNECT_BASE_DELAY_MS || 2000),
    maxDelayMs: Number(process.env.RECONNECT_MAX_DELAY_MS || 60000)
  },
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
