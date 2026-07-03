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

export const rawLogger = pino({ level: 'silent' });
export const activityLogs = [];

const write = (level, color, message, meta) => {
  const time = new Date().toLocaleString('id-ID');
  activityLogs.unshift({ time, level, message, meta: meta || null });
  if (activityLogs.length > 200) activityLogs.pop();
  console.log(`${colors.gray}[${time}]${colors.reset} ${color}${level.toUpperCase()}${colors.reset} ${message}`, meta || '');
};

export const logger = {
  info: (message, meta) => write('info', colors.cyan, message, meta),
  success: (message, meta) => write('success', colors.green, message, meta),
  warn: (message, meta) => write('warn', colors.yellow, message, meta),
  error: (message, meta) => write('error', colors.red, message, meta),
  debug: (message, meta) => write('debug', colors.blue, message, meta)
};
