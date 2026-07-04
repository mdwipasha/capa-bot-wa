import { config } from '../../config/env.js';
import { SessionManager } from './SessionManager.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class SessionService {
  constructor(manager = new SessionManager()) {
    this.manager = manager;
  }

  createSession(phoneNumber) {
    return this.manager.createSession(phoneNumber);
  }

  removeSession(phoneNumber) {
    return this.manager.removeSession(phoneNumber);
  }

  restartSession(phoneNumber) {
    return this.manager.restartSession(phoneNumber);
  }

  disconnectSession(phoneNumber) {
    return this.manager.disconnectSession(phoneNumber);
  }

  reconnectSession(phoneNumber) {
    return this.manager.reconnectSession(phoneNumber);
  }

  getSession(phoneNumber) {
    return this.manager.getSession(phoneNumber);
  }

  getAllSessions() {
    return this.manager.getAllSessions();
  }

  restoreSessions() {
    return this.manager.restoreSessions();
  }

  async requestPairingCode(phoneNumber) {
    const session = await this.manager.createSession(phoneNumber);
    if (session.botState.isConnected) {
      return {
        sessionId: session.id,
        pairing_code: '',
        status: 'CONNECTED',
        message: 'Session sudah connected'
      };
    }

    if (!session.botState.pairingCode && session.sock && !session.sock.authState?.creds?.registered) {
      try {
        session.botState.pairingCode = await session.sock.requestPairingCode(session.phoneNumber);
        session.botState.pairingStatus = `Pairing code aktif: ${session.botState.pairingCode}`;
      } catch {
        // Socket startup also requests a code; keep waiting for that path below.
      }
    }

    for (let i = 0; i < 40; i += 1) {
      if (session.botState.pairingCode) {
        return {
          sessionId: session.id,
          pairing_code: session.botState.pairingCode,
          status: session.status
        };
      }
      await wait(250);
    }

    return {
      sessionId: session.id,
      pairing_code: '',
      status: session.status,
      message: session.botState.pairingStatus || 'Pairing code belum tersedia'
    };
  }

  async listSessions() {
    return this.manager.getAllSessionRecords();
  }

  async getSessionDetail(id) {
    return this.manager.getSessionRecord(id);
  }

  async getGroups(id) {
    return this.manager.getGroups(id);
  }

  async getInfo(id) {
    return this.manager.getInfo(id);
  }

  async sendMessage(payload) {
    return this.manager.sendMessage(payload);
  }

  getLimit() {
    return config.maxSession;
  }
}
