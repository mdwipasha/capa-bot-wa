import { logger } from '../utils/logger.js';

export class LoggerService {
  constructor(baseLogger = logger) {
    this.logger = baseLogger;
  }

  write(level, { sessionId = '', botName = '', category = 'system', message = '', meta = null } = {}) {
    const prefix = [
      sessionId ? `[Bot ${sessionId}]` : '',
      botName ? `[${botName}]` : '',
      category ? `[${category}]` : ''
    ].filter(Boolean).join(' ');
    const text = `${prefix} ${message}`.trim();
    const write = this.logger[level] || this.logger.info;
    write(text, meta);
  }

  info(payload) {
    this.write('info', payload);
  }

  warning(payload) {
    this.write('warn', payload);
  }

  warn(payload) {
    this.warning(payload);
  }

  error(payload) {
    this.write('error', payload);
  }

  debug(payload) {
    this.write('debug', payload);
  }

  success(payload) {
    this.write('success', payload);
  }
}
