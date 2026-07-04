import { createCommandHandler } from '../handlers/commandHandler.js';

export class MessageRouter {
  constructor({
    loader,
    eventBus,
    statsManager,
    loggerService,
    disabledCommands = new Set(),
    pluginManager = null,
    commandManager = null
  } = {}) {
    this.loader = loader;
    this.commandManager = commandManager;
    this.eventBus = eventBus;
    this.stats = statsManager;
    this.logger = loggerService;
    this.disabledCommands = disabledCommands;
    this.pluginManager = pluginManager;
    this.handlers = new Map();
    this.botManager = null;
  }

  getLoaderProxy(botId = null) {
    // CommandManager sebagai primary source jika tersedia
    if (this.commandManager) {
      return {
        get: (name) => {
          if (this.disabledCommands.has(name)) return null;
          const command = this.commandManager.getCommand(name, botId);
          if (!command) return null;
          if (this.disabledCommands.has(command.name)) return null;
          return command;
        },
        list: () => {
          return this.commandManager.getEnabledCommands(botId).filter(
            (command) => !this.disabledCommands.has(command.name)
          );
        }
      };
    }

    // Fallback: loader + pluginManager (backward compat)
    return {
      get: (name) => {
        const command = this.loader.get(name);
        if (!command) return null;
        if (this.disabledCommands.has(command.name) || this.disabledCommands.has(name)) return null;
        if (this.pluginManager) {
          const entry = this.pluginManager.registry.get(command.name);
          if (entry && entry.enabled === false) return null;
          if (botId && entry && !this.pluginManager.registry.isEnabledForBot(botId, command.name)) return null;
        }
        return command;
      },
      list: () => {
        const all = this.loader.list();
        return all.filter((command) => {
          if (this.disabledCommands.has(command.name)) return false;
          if (this.pluginManager) {
            const entry = this.pluginManager.registry.get(command.name);
            if (entry && entry.enabled === false) return false;
            if (botId && entry && !this.pluginManager.registry.isEnabledForBot(botId, command.name)) return false;
          }
          return true;
        });
      }
    };
  }

  getHandler(session) {
    if (!this.handlers.has(session.id)) {
      this.handlers.set(session.id, createCommandHandler({
        loader: this.getLoaderProxy(session.id),
        botState: session.botState,
        session,
        botManager: this.botManager,
        commandManager: this.commandManager,
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

