export class BotRegistry {
  constructor() {
    this.bots = new Map();
  }

  set(sessionId, bot) {
    this.bots.set(sessionId, bot);
    return bot;
  }

  get(sessionId) {
    return this.bots.get(sessionId) || null;
  }

  delete(sessionId) {
    return this.bots.delete(sessionId);
  }

  all() {
    return [...this.bots.values()];
  }

  sync(bots = []) {
    const activeIds = new Set();
    for (const bot of bots) {
      activeIds.add(bot.id);
      this.set(bot.id, bot);
    }
    for (const id of this.bots.keys()) {
      if (!activeIds.has(id)) this.delete(id);
    }
    return this.all();
  }
}
