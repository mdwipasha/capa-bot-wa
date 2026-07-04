import { db } from '../../database/index.js';

const normalizePhoneNumber = (value = '') => String(value).replace(/\D/g, '');

const nowIso = () => new Date().toISOString();

export class SessionStore {
  constructor(database = db) {
    this.db = database;
  }

  normalizePhoneNumber(phoneNumber) {
    return normalizePhoneNumber(phoneNumber);
  }

  async all() {
    const data = await this.db.read();
    return Object.values(data.sessions || {});
  }

  async get(id) {
    const data = await this.db.read();
    return data.sessions?.[id] || null;
  }

  async upsert(phoneNumber, patch = {}) {
    const id = normalizePhoneNumber(phoneNumber);
    if (!id) throw new Error('phone_number wajib diisi');

    let record;
    await this.db.update((store) => {
      store.sessions ||= {};
      const previous = store.sessions[id] || {
        id,
        phone_number: id,
        display_name: '',
        status: 'DISCONNECTED',
        connected_at: null,
        last_seen: null,
        created_at: nowIso(),
        updated_at: nowIso()
      };

      record = {
        ...previous,
        ...patch,
        id,
        phone_number: id,
        updated_at: nowIso()
      };
      store.sessions[id] = record;
    });

    return record;
  }

  async remove(id) {
    const sessionId = normalizePhoneNumber(id);
    await this.db.update((store) => {
      store.sessions ||= {};
      delete store.sessions[sessionId];
    });
  }
}
