import { logger } from '../utils/logger.js';

// Restricted rooms requiring admin/owner/developer roles
const RESTRICTED_ROOMS = ['logs', 'system'];
const ALLOWED_ROLES = ['owner', 'admin', 'developer'];

export class SocketRooms {
  /**
   * Register subscribe/unsubscribe and room listeners on client socket connection
   */
  static register(socket) {
    // 1. Subscribe method
    socket.on('subscribe', (roomName) => {
      SocketRooms.joinRoom(socket, roomName);
    });

    // 2. Unsubscribe method
    socket.on('unsubscribe', (roomName) => {
      SocketRooms.leaveRoom(socket, roomName);
    });

    // 3. Backward compatible joinRoom method
    socket.on('joinRoom', (roomName) => {
      SocketRooms.joinRoom(socket, roomName);
    });

    // 4. Backward compatible leaveRoom method
    socket.on('leaveRoom', (roomName) => {
      SocketRooms.leaveRoom(socket, roomName);
    });
  }

  /**
   * Join a room with access validation
   */
  static joinRoom(socket, room) {
    if (!room || typeof room !== 'string') {
      socket.emit('error', { message: 'Invalid room name parameter' });
      return;
    }

    const trimmedRoom = room.trim();
    
    // Check permission for restricted rooms
    if (RESTRICTED_ROOMS.includes(trimmedRoom)) {
      const userRole = socket.user?.role || 'viewer';
      if (!ALLOWED_ROLES.includes(userRole)) {
        logger.warn(`[websocket] Join room "${trimmedRoom}" rejected: User "${socket.user?.username}" (role: ${userRole}) is unauthorized.`);
        socket.emit('error', { message: `Permission Denied: Access to room "${trimmedRoom}" is restricted.` });
        return;
      }
    }

    socket.join(trimmedRoom);
    logger.info(`[websocket] Socket ${socket.id} joined room: "${trimmedRoom}" (User: "${socket.user?.username}")`);
    socket.emit('subscribed', { room: trimmedRoom });
  }

  /**
   * Leave a room
   */
  static leaveRoom(socket, room) {
    if (!room || typeof room !== 'string') return;
    const trimmedRoom = room.trim();
    
    socket.leave(trimmedRoom);
    logger.info(`[websocket] Socket ${socket.id} left room: "${trimmedRoom}"`);
    socket.emit('unsubscribed', { room: trimmedRoom });
  }
}
