import { config } from "../../config/env.js";
import { SessionManager } from "./SessionManager.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class SessionService {
  constructor(manager = new SessionManager()) {
    this.manager = manager;
  }

  createSession(phoneNumber, options) {
    return this.manager.createSession(phoneNumber, options);
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

  requestPairingCode(phoneNumber) {
    return this.manager.requestPairingCode(phoneNumber);
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
