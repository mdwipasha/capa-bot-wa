import fs from 'fs-extra';
import { DatabaseAdapter } from './DatabaseAdapter.js';

const defaultData = {
  users: {},
  groups: {},
  chats: {},
  settings: {
    welcome: {},
    goodbye: {},
    antilink: {},
    antispam: {},
    antibadword: {},
    mute: {},
    autoreact: {},
    autoreply: {},
    autosticker: {},
    autoread: {},
    autodetectlang: {},
    antitagall: {},
    antibot: {},
    antifakenumber: {},
    antidelete: {},
    antitoxic: {},
    badwords: [ 'anjing',
      'ajg',
      'ngentot',
      'ngentod',
      'monyet',
      'bangsat',
      'kontol',
      'memek',
      'babi']
  },
  votes: {},
  games: {},
  blocked: {},
  sessions: {},
  stats: {
    commands: 0,
    messages: 0,
    startedAt: Date.now()
  }
};

export class JsonDatabase extends DatabaseAdapter {
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this.data = structuredClone(defaultData);
  }

  async init() {
    await fs.ensureFile(this.filePath);
    const exists = await fs.readJson(this.filePath).catch(() => null);
    this.data = { ...structuredClone(defaultData), ...(exists || {}) };
    await this.write(this.data);
    return this.data;
  }

  async read() {
    this.data = await fs.readJson(this.filePath).catch(() => this.data);
    return this.data;
  }

  async write(data = this.data) {
    this.data = data;
    await fs.writeJson(this.filePath, data, { spaces: 2 });
    return this.data;
  }

  async update(mutator) {
    const data = await this.read();
    await mutator(data);
    return this.write(data);
  }
}
