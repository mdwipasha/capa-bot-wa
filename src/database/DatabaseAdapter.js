export class DatabaseAdapter {
  async init() { throw new Error('init() must be implemented'); }
  async read() { throw new Error('read() must be implemented'); }
  async write() { throw new Error('write() must be implemented'); }
}
