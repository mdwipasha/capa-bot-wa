import { SocketServer } from './SocketServer.js';
import { socketAuth } from './SocketAuth.js';
import { SocketRooms } from './SocketRooms.js';
import { SocketEvents } from './SocketEvents.js';
import { logger } from '../utils/logger.js';

export class SocketGateway {
  constructor() {
    this.server = null;
    this.events = null;
    this.botManager = null;
    this.initialized = false;
  }

  /**
   * Initialize Socket.IO server, authentication, rooms, and event listeners
   * @param {import('http').Server} httpServer
   * @param {import('../manager/BotManager.js').BotManager} botManager
   */
  init(httpServer, botManager) {
    if (this.initialized) return this;

    this.botManager = botManager;
    
    // 1. Create socket.io server wrapper
    this.server = new SocketServer(httpServer);

    // 2. Attach JWT authentication middleware
    this.server.use(socketAuth);

    // 3. Handle connection setup
    this.server.onConnection((socket) => {
      // Register subscription rooms logic
      SocketRooms.register(socket);

      // Notify clients of successful connection initialization and version
      socket.emit('ready', {
        session: socket.id,
        user: socket.user,
        timestamp: new Date().toISOString()
      });
    });

    // Mark global hook so logger write can communicate directly
    global.socketGatewayAttached = true;
    this.initialized = true;

    // 4. Start manager event relayer and metrics ticker
    this.events = new SocketEvents(this, botManager);
    this.events.start();

    logger.success('[websocket] WebSocket Gateway successfully initialized and listening.');
    
    return this;
  }

  /**
   * Broadcast message to a specific room namespace
   * @param {string} room
   */
  to(room) {
    if (!this.initialized) {
      throw new Error('SocketGateway is not initialized. Call init() first.');
    }
    return this.server.to(room);
  }

  /**
   * Broadcast message to all connected clients globally
   */
  emit(event, data) {
    if (!this.initialized) {
      throw new Error('SocketGateway is not initialized. Call init() first.');
    }
    this.server.emit(event, data);
  }

  /**
   * Shutdown Socket.IO instance and release event hooks
   */
  close() {
    if (!this.initialized) return;

    logger.info('[websocket] Closing WebSocket Gateway...');
    
    global.socketGatewayAttached = false;
    
    if (this.events) {
      this.events.stop();
      this.events = null;
    }

    if (this.server) {
      this.server.close();
      this.server = null;
    }

    this.initialized = false;
  }
}

// Export singleton instance
export const socketGateway = new SocketGateway();
export default socketGateway;
