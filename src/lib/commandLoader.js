import fs from 'fs-extra';
import path from 'path';
import { pathToFileURL } from 'url';
import { logger } from '../utils/logger.js';

export class CommandLoader {
  constructor(commandsDir) {
    this.commandsDir = commandsDir;
    this.commands = new Map();
    this.aliases = new Map();
  }

  async load() {
    this.commands.clear();
    this.aliases.clear();
    const files = await this.walk(this.commandsDir);
    for (const file of files) await this.loadFile(file);
    logger.success(`Loaded ${this.commands.size} commands`);
  }

  async walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    const files = await Promise.all(entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? this.walk(full) : full;
    }));
    return files.flat().filter((file) => file.endsWith('.js'));
  }

  async loadFile(file) {
    try {
      const module = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
      const command = module.default;
      if (!command?.name || typeof command.execute !== 'function') return;
      this.commands.set(command.name, command);
      for (const alias of command.alias || []) this.aliases.set(alias, command.name);
    } catch (error) {
      logger.error(`Failed loading command ${file}`, error.message);
    }
  }

  get(name) {
    return this.commands.get(name) || this.commands.get(this.aliases.get(name));
  }

  list() {
    return [...this.commands.values()];
  }

  watch(onReload) {
    fs.watch(this.commandsDir, { recursive: true }, async (_, filename) => {
      if (!filename?.endsWith('.js')) return;
      await this.load();
      onReload?.();
    });
  }
}
