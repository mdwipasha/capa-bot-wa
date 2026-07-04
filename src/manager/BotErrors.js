export class BotManagerError extends Error {
  constructor(message, code = 'BOT_MANAGER_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class BotNotFoundError extends BotManagerError {
  constructor(sessionId) {
    super(`Bot ${sessionId} tidak ditemukan`, 'BOT_NOT_FOUND');
  }
}

export class BotOfflineError extends BotManagerError {
  constructor(sessionId) {
    super(`Bot ${sessionId} sedang offline`, 'BOT_OFFLINE');
  }
}

export class SessionExpiredError extends BotManagerError {
  constructor(sessionId) {
    super(`Session ${sessionId} expired atau logged out`, 'SESSION_EXPIRED');
  }
}

export class PluginError extends BotManagerError {
  constructor(message) {
    super(message, 'PLUGIN_ERROR');
  }
}

export class CommandError extends BotManagerError {
  constructor(message) {
    super(message, 'COMMAND_ERROR');
  }
}
