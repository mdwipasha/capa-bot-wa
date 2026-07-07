import pino from 'pino';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};
// Respect LOG_LEVEL environment variable to control verbosity
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
export const rawLogger = pino({ level: 'silent' });
export const activityLogs = [];

const write = (level, color, message, meta) => {
  let msgText = message;
  let logMeta = meta;

  if (message && typeof message === 'object') {
    msgText = message.message || '';
    const category = message.category || 'system';
    logMeta = message.meta || meta || null;
    
    const prefix = [
      message.sessionId ? `[Bot ${message.sessionId}]` : '',
      message.botName ? `[${message.botName}]` : '',
      category ? `[${category}]` : ''
    ].filter(Boolean).join(' ');
    
    if (prefix) {
      msgText = `${prefix} ${msgText}`.trim();
    }
  }

  const time = new Date().toLocaleString('id-ID');
  const logEntry = { time, level, message: msgText, meta: logMeta || null };
  activityLogs.unshift(logEntry);
  if (activityLogs.length > 200) activityLogs.pop();
  // Filter by configured LOG_LEVEL
  const priorities = { debug: 10, info: 20, success: 20, warn: 30, error: 40 };
  const current = priorities[level] || 20;
  const configured = priorities[LOG_LEVEL] || 20;
  if (current < configured) return;

  // Optional: silence noisy connection logs when env var set
  if (process.env.SILENCE_CONNECTION_LOGS === '1') {
    const lc = (msgText || '').toString().toLowerCase();
    if (lc.includes('connection') || lc.includes('reconnect') || lc.includes('connection update')) return;
  }

  console.log(`${colors.gray}[${time}]${colors.reset} ${color}${level.toUpperCase()}${colors.reset} ${msgText}`, logMeta || '');
  
  if (typeof logger.onLog === 'function') {
    logger.onLog(logEntry);
  }
};

export const logger = {
  info: (message, meta) => write('info', colors.cyan, message, meta),
  success: (message, meta) => write('success', colors.green, message, meta),
  warn: (message, meta) => write('warn', colors.yellow, message, meta),
  error: (message, meta) => write('error', colors.red, message, meta),
  debug: (message, meta) => write('debug', colors.blue, message, meta),
  onLog: null
};
