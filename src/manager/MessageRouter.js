import { createCommandHandler } from '../handlers/commandHandler.js';

export class MessageRouter {
  constructor({ loader, eventBus, statsManager, loggerService, disabledCommands = new Set() } = {}) {
    this.loader = loader;
    this.eventBus = eventBus;
    this.stats = statsManager;
    this.logger = loggerService;
    this.disabledCommands = disabledCommands;
    this.handlers = new Map();
    this.botManager = null;
  }

  getLoaderProxy() {
    return {
      get: (name) => {
        const command = this.loader.get(name);
        if (!command) return null;
        if (this.disabledCommands.has(command.name) || this.disabledCommands.has(name)) return null;
        return command;
      },
      list: () => this.loader.list().filter((command) => !this.disabledCommands.has(command.name))
    };
  }

  getHandler(session) {
    if (!this.handlers.has(session.id)) {
      this.handlers.set(session.id, createCommandHandler({
        loader: this.getLoaderProxy(),
        botState: session.botState,
        session,
        botManager: this.botManager,
        eventBus: this.eventBus,
        statsManager: this.stats
      }));
    }
    return this.handlers.get(session.id);
  }

  clear(sessionId = null) {
    if (sessionId) this.handlers.delete(sessionId);
    else this.handlers.clear();
  }

  async routeIncoming({ session, sock, msg }) {
    msg.__sessionId = session.id;
    this.stats?.increment(session.id, 'messagesReceived');
    this.eventBus?.emitEvent('message.received', { sessionId: session.id, message: msg });

    try {
      await this.getHandler(session)({ sock, msg });
    } catch (error) {
      this.stats?.increment(session.id, 'errors');
      this.eventBus?.emitEvent('bot.error', { sessionId: session.id, error });
      this.logger?.error({
        sessionId: session.id,
        category: 'message',
        message: error.stack || error.message
      });
      throw error;
    }
  }
}
