import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';
import { configManager } from '../manager/ConfigManager.js';

export class SocketServer {
  constructor(httpServer, options = {}) {
    const corsOrigins = configManager.get('security', 'corsOrigins') || ['*'];
    
    const defaultOptions = {
      cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
      },
      pingTimeout: 20000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      // Compression
      compress: true
    };

    const serverOptions = { ...defaultOptions, ...options };
    this.io = new Server(httpServer, serverOptions);
    
    logger.info('[websocket] SocketServer instance created.');
  }

  /**
   * Attach scalability adapter (e.g. Redis)
   * Example: socketServer.attachAdapter(createAdapter(redisClient))
   */
  attachAdapter(adapter) {
    if (adapter) {
      this.io.adapter(adapter);
      logger.info('[websocket] Custom Adapter attached successfully.');
    }
  }

  /**
   * Register global authentication middleware
   */
  use(middlewareFn) {
    this.io.use(middlewareFn);
  }

  /**
   * Listen to connection events
   */
  onConnection(callback) {
    this.io.on('connection', (socket) => {
      logger.info(`[websocket] Client connected: ${socket.id} (IP: ${socket.handshake.address})`);
      
      socket.on('disconnect', (reason) => {
        logger.info(`[websocket] Client disconnected: ${socket.id} (Reason: ${reason})`);
      });

      callback(socket);
    });
  }

  /**
   * Broadcast to all connected clients
   */
  emit(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Broadcast to specific room
   */
  to(room) {
    return this.io.to(room);
  }

  /**
   * Disconnect sockets authenticated with a blacklisted JWT (by JTI).
   * @param {string} tokenJti
   * @returns {number} count of disconnected sockets
   */
  disconnectByTokenJti(tokenJti) {
    if (!tokenJti) return 0;
    let count = 0;
    for (const [, socket] of this.io.sockets.sockets) {
      if (socket.tokenJti === tokenJti) {
        socket.disconnect(true);
        count += 1;
      }
    }
    return count;
  }

  /**
   * Disconnect sockets authenticated as a specific API user.
   * @param {string} userId
   * @returns {number} count of disconnected sockets
   */
  disconnectByUserId(userId) {
    if (!userId) return 0;
    let count = 0;
    for (const [, socket] of this.io.sockets.sockets) {
      if (socket.user?.id === userId) {
        socket.disconnect(true);
        count += 1;
      }
    }
    return count;
  }

  /**
   * Close server connection
   */
  close() {
    this.io.close(() => {
      logger.info('[websocket] SocketServer server stopped.');
    });
  }
}
