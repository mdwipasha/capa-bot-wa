import { logger } from '../utils/logger.js';
import { authManager } from '../manager/AuthManager.js';

// Mapping restricted rooms to their required granular permissions
const ROOM_PERMISSIONS = {
  logs: 'ws.logs',
  system: 'ws.system'
};

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
    const userRole = socket.user?.role || 'viewer';
    
    // Check permission for restricted rooms
    const requiredPermission = ROOM_PERMISSIONS[trimmedRoom];
    if (requiredPermission) {
      if (!authManager.hasPermission(userRole, requiredPermission)) {
        logger.warn(`[websocket] Join room "${trimmedRoom}" rejected: User "${socket.user?.username}" (role: ${userRole}) lacks permission "${requiredPermission}".`);
        socket.emit('error', { message: `Permission Denied: Access to room "${trimmedRoom}" is restricted.` });
        
        // Audit log permission denied on WebSocket room join
        UserModelAuditBridge(socket.user?.id, 'ws.join_rejected', { room: trimmedRoom, requiredPermission });
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

/**
 * Audit bridge helper for websocket to safely invoke auditLog without importing UserModel directly.
 */
async function UserModelAuditBridge(userId, action, details) {
  try {
    const { UserModel } = await import('../models/UserModel.js');
    await UserModel.auditLog({
      action,
      userId: userId || 'system',
      performedBy: userId || 'system',
      details
    });
  } catch (err) {
    logger.error(`[websocket] Failed to write audit log for room join failure: ${err.message}`);
  }
}
