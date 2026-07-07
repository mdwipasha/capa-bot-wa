import fs from "fs-extra";
import path from "path";
import { DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { config } from "../../config/env.js";
import { createSocket, requestPairingCode } from "../../lib/baileys.js";
import { handleGroupParticipantsUpdate } from "../../events/groupParticipants.js";
import { logger } from "../../utils/logger.js";
import { SessionStore } from "./SessionStore.js";
import QRCode from "qrcode";

export const SessionStatus = Object.freeze({
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  RECONNECTING: "RECONNECTING",
  LOGGED_OUT: "LOGGED_OUT",
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const nowIso = () => new Date().toISOString();

export class SessionManager {
  constructor({
    loader,
    store = new SessionStore(),
    sessionBasePath = config.sessionBasePath,
    messageRouter = null,
    eventBus = null,
    statsManager = null,
  } = {}) {
    this.loader = loader;
    this.store = store;
    this.sessionBasePath = sessionBasePath;
    this.messageRouter = messageRouter;
    this.eventBus = eventBus;
    this.statsManager = statsManager;
    this.sessions = new Map();
  }

  async restoreSessions() {
    await fs.ensureDir(this.sessionBasePath);
    const directories = await fs
      .readdir(this.sessionBasePath, { withFileTypes: true })
      .catch(() => []);
    const ids = directories
      .filter((entry) => entry.isDirectory())
      .map((entry) => this.store.normalizePhoneNumber(entry.name))
      .filter(Boolean);

    if (!ids.length && config.ownerNumber) {
      const legacyCreds = path.join(config.sessionPath, "creds.json");
      if (await fs.pathExists(legacyCreds)) {
        const legacyId = this.store.normalizePhoneNumber(config.ownerNumber);
        await fs
          .copy(config.sessionPath, this.getSessionPath(legacyId), {
            overwrite: false,
          })
          .catch(() => {});
        ids.push(legacyId);
        this.log(
          legacyId,
          "info",
          "Legacy session copied to multi-session storage",
        );
      }
    }

    for (const record of await this.store.all()) {
      const id = this.store.normalizePhoneNumber(
        record.phone_number || record.id,
      );
      if (id && !ids.includes(id)) ids.push(id);
    }

    for (const id of ids.slice(0, config.maxSession)) {
      await this.createSession(id, { autoRestore: true }).catch((error) => {
        this.log(id, "error", `Restore gagal: ${error.message}`);
      });
    }
  }

  async createSession(phoneNumber, { authMethod } = {}) {
    const id = this.store.normalizePhoneNumber(phoneNumber);
    if (!id) throw new Error("phone_number wajib diisi");
    if (this.sessions.has(id)) return this.sessions.get(id);
    if (this.sessions.size >= config.maxSession)
      throw new Error(`Session limit tercapai (${config.maxSession})`);

    const session = this.buildSession(id, authMethod);
    this.sessions.set(id, session);
    await this.store.upsert(id, { status: SessionStatus.CONNECTING });
    this.eventBus?.emitEvent("bot.created", { sessionId: id });
    await this.connectSession(session);
    return session;
  }

  async removeSession(phoneNumber) {
    const id = this.store.normalizePhoneNumber(phoneNumber);
    const session = this.sessions.get(id);
    if (session) await this.disconnectSession(id, { removeFromMemory: true });
    await fs.remove(this.getSessionPath(id));
    await this.store.remove(id);
    this.eventBus?.emitEvent("bot.deleted", { sessionId: id });
  }

  async restartSession(phoneNumber) {
    const id = this.store.normalizePhoneNumber(phoneNumber);
    await this.disconnectSession(id);
    return this.reconnectSession(id);
  }

  async disconnectSession(phoneNumber, options = {}) {
    const id = this.store.normalizePhoneNumber(phoneNumber);
    const session = this.sessions.get(id);
    if (!session) return null;

    session.manualDisconnect = true;
    session.reconnectToken += 1;
    if (session.reconnectTimer) clearTimeout(session.reconnectTimer);
    session.reconnectTimer = null;
    this.detachSocket(session);
    session.sock?.end?.();
    session.sock = null;
    session.botState.isConnected = false;
    session.botState.pairingStatus = "Disconnected";
    session.status = SessionStatus.DISCONNECTED;
    await this.store.upsert(id, {
      status: SessionStatus.DISCONNECTED,
      last_seen: nowIso(),
    });
    this.log(id, "warn", "Disconnected");
    this.eventBus?.emitEvent("bot.stopped", { sessionId: id });

    if (options.removeFromMemory) this.sessions.delete(id);
    return session;
  }

  async reconnectSession(phoneNumber) {
    const id = this.store.normalizePhoneNumber(phoneNumber);
    const session = this.sessions.get(id) || (await this.createSession(id));
    session.manualDisconnect = false;
    session.reconnectAttempts = 0;
    await this.store.upsert(id, { status: SessionStatus.RECONNECTING });
    return this.connectSession(session, { reconnect: true });
  }

  getSession(phoneNumber) {
    return (
      this.sessions.get(this.store.normalizePhoneNumber(phoneNumber)) || null
    );
  }

  getAllSessions() {
    return [...this.sessions.values()];
  }

  async getAllSessionRecords() {
    const records = await this.store.all();
    const active = new Map(
      this.getAllSessions().map((session) => [session.id, session]),
    );
    return records.map((record) =>
      this.serializeSession(active.get(record.id), record),
    );
  }

  async getSessionRecord(id) {
    const record = await this.store.get(this.store.normalizePhoneNumber(id));
    const session = this.getSession(id);
    return record || session ? this.serializeSession(session, record) : null;
  }

  async getGroups(id) {
    const session = this.requireConnectedSession(id);
    const groups = await session.sock.groupFetchAllParticipating();
    return Object.values(groups).map((group) => ({
      id: group.id,
      subject: group.subject,
      participants: group.participants?.length || 0,
    }));
  }

  async requestPairingCode(phoneNumber) {
    const id = this.store.normalizePhoneNumber(phoneNumber);
    const session = this.sessions.has(id)
      ? this.sessions.get(id)
      : await this.createSession(id);

    if (session.botState.isConnected) {
      return {
        sessionId: session.id,
        pairingCode: "",
        status: session.status,
        message: "Session sudah connected",
      };
    }
    if (!session.sock)
      throw new Error(
        "Socket belum siap, tunggu beberapa detik lalu coba lagi",
      );
    if (session.sock.authState?.creds?.registered) {
      return {
        sessionId: session.id,
        pairingCode: "",
        status: session.status,
        message: "Session sudah terdaftar",
      };
    }

    if (!session.botState.pairingCode) {
      try {
        await requestPairingCodeSocket(
          session.sock,
          session.botState,
          session.phoneNumber,
          {
            onPairingUpdate: (payload) => {
              this.eventBus?.emitEvent("session.updated", {
                sessionId: session.id,
                ...payload,
              });
              this.eventBus?.emitEvent("bot.updated", {
                sessionId: session.id,
                ...payload,
              });
            },
          },
        );
      } catch (error) {
        this.log(session.id, "warn", `Pairing request gagal: ${error.message}`);
      }
    }

    // tunggu maksimal 10 detik kalau proses masih jalan di background
    for (let i = 0; i < 40; i += 1) {
      if (session.botState.pairingCode) {
        return {
          sessionId: session.id,
          pairingCode: session.botState.pairingCode,
          status: session.status,
        };
      }
      await sleep(250);
    }

    return {
      sessionId: session.id,
      pairingCode: "",
      status: session.status,
      message: session.botState.pairingStatus || "Pairing code belum tersedia",
    };
  }

  async getInfo(id) {
    const session = this.requireSession(id);
    return {
      ...this.serializeSession(session, await this.store.get(session.id)),
      user: session.sock?.user || null,
      sessionPath: session.sessionPath,
      reconnectAttempts: session.reconnectAttempts,
    };
  }

  async sendMessage({ sessionId, phone, message }) {
    const session = this.requireConnectedSession(sessionId);
    const to = `${this.store.normalizePhoneNumber(phone)}@s.whatsapp.net`;
    if (!message) throw new Error("message wajib diisi");
    return session.sock.sendMessage(to, { text: message });
  }

  buildSession(id, authMethod) {
    return {
      id,
      phoneNumber: id,
      sessionPath: this.getSessionPath(id),
      authMethod:
        authMethod === "qr" || authMethod === "pairing"
          ? authMethod
          : config.authMethod, // ← baru
      sock: null,
      listeners: [],
      status: SessionStatus.DISCONNECTED,
      reconnectAttempts: 0,
      reconnectTimer: null,
      reconnectToken: 0,
      manualDisconnect: false,
      memory: {},
      cache: new Map(),
      botState: {
        sessionId: id,
        isConnected: false,
        qr: null,
        pairingCode: "",
        pairingStatus: "Starting",
      },
    };
  }

  async connectSession(session, options = {}) {
    session.status = options.reconnect
      ? SessionStatus.RECONNECTING
      : SessionStatus.CONNECTING;
    session.botState.pairingStatus =
      session.status === SessionStatus.RECONNECTING
        ? "Reconnecting"
        : "Connecting";
    await this.store.upsert(session.id, { status: session.status });
    this.log(
      session.id,
      "info",
      session.status === SessionStatus.RECONNECTING
        ? "Reconnecting"
        : "Connecting",
    );

    this.detachSocket(session);
    session.reconnectToken += 1;
    const token = session.reconnectToken;
    session.sock = await createSocket(session.botState, {
      sessionPath: session.sessionPath,
      authMethod: session.authMethod, // ← baru
      pairingPhoneNumber: session.phoneNumber,
      onPairingUpdate: (payload) => {
        if (token !== session.reconnectToken) return;
        this.eventBus?.emitEvent("session.updated", {
          sessionId: session.id,
          ...payload,
        });
        this.eventBus?.emitEvent("bot.updated", {
          sessionId: session.id,
          ...payload,
        });
      },
    });

    this.wrapSocket(session);

    const messageListener = async ({ messages }) => {
      for (const msg of messages) {
        msg.__sessionId = session.id;
        this.log(
          session.id,
          "info",
          `Received Message ${msg.key?.remoteJid || ""}`,
        );
        if (this.messageRouter)
          await this.messageRouter.routeIncoming({
            session,
            sock: session.sock,
            msg,
          });
      }
    };
    const groupListener = async (update) =>
      handleGroupParticipantsUpdate({ sock: session.sock, update, session });
    const connectionListener = (update) =>
      this.handleConnectionUpdate(session, update, token);

    session.sock.ev.on("messages.upsert", messageListener);
    session.sock.ev.on("group-participants.update", groupListener);
    session.sock.ev.on("connection.update", connectionListener);
    session.listeners = [
      ["messages.upsert", messageListener],
      ["group-participants.update", groupListener],
      ["connection.update", connectionListener],
    ];
    this.eventBus?.emitEvent("bot.started", { sessionId: session.id });

    return session;
  }

  async handleConnectionUpdate(session, update, token) {
    if (token !== session.reconnectToken) return;
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      session.botState.qr = qr;
      session.botState.pairingCode = "";
      session.botState.pairingStatus =
        "QR tersedia. Scan dari WhatsApp > Perangkat tertaut.";
      const qrImage = await QRCode.toDataURL(qr, {
        width: 320,
        margin: 1,
      }).catch(() => "");
      this.eventBus?.emitEvent("session.updated", {
        sessionId: session.id,
        qr,
        qrImage,
        pairingStatus: session.botState.pairingStatus,
      });
      this.eventBus?.emitEvent("bot.updated", {
        sessionId: session.id,
        qr,
        qrImage,
        pairingStatus: session.botState.pairingStatus,
      });
    }

    if (connection === "open") {
      session.status = SessionStatus.CONNECTED;
      session.reconnectAttempts = 0;
      session.manualDisconnect = false;
      session.botState.isConnected = true;
      session.botState.qr = null;
      session.botState.pairingStatus = "Connected";
      await this.store.upsert(session.id, {
        display_name:
          session.sock?.user?.name || session.sock?.user?.verifiedName || "",
        status: SessionStatus.CONNECTED,
        connected_at: nowIso(),
        last_seen: nowIso(),
      });
      this.log(session.id, "success", "Connected");
      this.eventBus?.emitEvent("bot.connected", { sessionId: session.id });
    }

    if (connection === "close") {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      session.botState.isConnected = false;
      session.status = loggedOut
        ? SessionStatus.LOGGED_OUT
        : SessionStatus.DISCONNECTED;
      session.botState.pairingStatus = loggedOut
        ? "Logged out"
        : "Disconnected";
      await this.store.upsert(session.id, {
        status: session.status,
        last_seen: nowIso(),
      });
      this.log(
        session.id,
        "warn",
        loggedOut ? "Logged out" : `Disconnected: ${statusCode || "unknown"}`,
      );
      this.detachSocket(session);
      this.eventBus?.emitEvent("bot.disconnected", {
        sessionId: session.id,
        statusCode,
        loggedOut,
      });

      if (!loggedOut && !session.manualDisconnect)
        this.scheduleReconnect(session);
    }
  }

  scheduleReconnect(session) {
    if (session.reconnectTimer) return;
    if (session.reconnectAttempts >= config.reconnect.maxAttempts) {
      this.log(session.id, "warn", "Reconnect limit tercapai");
      return;
    }

    session.reconnectAttempts += 1;
    this.statsManager?.increment(session.id, "reconnectCount");
    const delay = Math.min(
      config.reconnect.baseDelayMs * 2 ** (session.reconnectAttempts - 1),
      config.reconnect.maxDelayMs,
    );
    this.log(
      session.id,
      "info",
      `Reconnect attempt ${session.reconnectAttempts}/${config.reconnect.maxAttempts} in ${delay}ms`,
    );
    this.eventBus?.emitEvent("bot.reconnecting", {
      sessionId: session.id,
      attempt: session.reconnectAttempts,
      delay,
    });
    session.reconnectTimer = setTimeout(async () => {
      session.reconnectTimer = null;
      await sleep(50);
      if (!session.manualDisconnect) {
        await this.connectSession(session, { reconnect: true }).catch(
          (error) => {
            this.log(session.id, "error", `Reconnect error: ${error.message}`);
            this.scheduleReconnect(session);
          },
        );
      }
    }, delay);
  }

  detachSocket(session) {
    if (!session.sock?.ev || !session.listeners?.length) return;
    for (const [event, listener] of session.listeners) {
      session.sock.ev.off?.(event, listener);
      session.sock.ev.removeListener?.(event, listener);
    }
    session.listeners = [];
  }

  wrapSocket(session) {
    if (!session.sock?.sendMessage || session.sock.__botManagerWrapped) return;
    const originalSendMessage = session.sock.sendMessage.bind(session.sock);
    session.sock.sendMessage = async (jid, content, options) => {
      const result = await originalSendMessage(jid, content, options);
      this.statsManager?.increment(session.id, "messagesSent");
      this.eventBus?.emitEvent("message.sent", { sessionId: session.id, jid });
      return result;
    };
    session.sock.__botManagerWrapped = true;
  }

  serializeSession(session, record = null) {
    const base = record || {
      id: session.id,
      phone_number: session.phoneNumber,
      display_name: "",
      status: session.status,
      connected_at: null,
      last_seen: null,
      created_at: null,
      updated_at: null,
    };

    return {
      ...base,
      status: session?.status || base.status,
      connected: Boolean(session?.botState.isConnected),
      pairingStatus: session?.botState.pairingStatus || "",
      pairingCode: session?.botState.pairingCode || "",
      qr: session?.botState.qr || null, // ← baru
      authMethod: session?.authMethod || config.authMethod, // ← baru
    };
  }

  requireSession(id) {
    const session = this.getSession(id);
    if (!session) throw new Error("Session tidak ditemukan");
    return session;
  }

  requireConnectedSession(id) {
    const session = this.requireSession(id);
    if (!session.sock || !session.botState.isConnected)
      throw new Error("Session belum connected");
    return session;
  }

  getSessionPath(id) {
    return path.join(this.sessionBasePath, this.store.normalizePhoneNumber(id));
  }

  log(id, level, message) {
    const write = logger[level] || logger.info;
    write(`[Bot ${id}] ${message}`);
  }
}
