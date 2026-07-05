import jwt from 'jsonwebtoken';
import { configManager } from '../manager/ConfigManager.js';
import { UserModel } from '../models/UserModel.js';
import { logger } from '../utils/logger.js';

/**
 * Socket.IO authentication middleware.
 * Verifies JWT token or API Key, validates user, and attaches user to the socket object.
 */
export async function socketAuth(socket, next) {
  try {
    let token = '';
    let apiKey = '';

    // 1. Retrieve authentication parameters from auth object or headers
    const auth = socket.handshake.auth || {};
    const headers = socket.handshake.headers || {};
    const query = socket.handshake.query || {};

    // Check authorization header
    const authHeader = auth.token || headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (authHeader) {
      token = authHeader;
    }

    // Check API Key
    apiKey = auth.apiKey || headers['x-api-key'] || query['api_key'] || '';

    let user = null;
    let authMethod = '';

    // 2. Validate token
    if (token) {
      const jwtSecret = configManager.get('security', 'jwtSecret') || 'secret-wabot-key-123-change-me';
      try {
        const decoded = jwt.verify(token, jwtSecret);
        user = await UserModel.findById(decoded.userId);
        authMethod = 'jwt';
      } catch (err) {
        logger.warn(`[websocket] JWT verification failed for socket ${socket.id}: ${err.message}`);
        return next(new Error('Unauthorized: Invalid or expired token'));
      }
    } 
    // 3. Fallback to API Key
    else if (apiKey) {
      user = await UserModel.findByApiKey(apiKey);
      authMethod = 'api_key';
    }

    // 4. Validate user
    if (!user) {
      logger.warn(`[websocket] Connection rejected: No credentials provided for socket ${socket.id}`);
      return next(new Error('Unauthorized: Authentication credentials required'));
    }

    if (!user.isActive) {
      logger.warn(`[websocket] Connection rejected: User "${user.username}" is inactive for socket ${socket.id}`);
      return next(new Error('Unauthorized: Account is inactive'));
    }

    // Sanitize user profile and attach to socket
    socket.user = UserModel.sanitize(user);
    socket.authMethod = authMethod;

    logger.success?.(`[websocket] Authentication successful: User "${user.username}" (${user.role}) connected on socket ${socket.id}`) ||
      logger.info(`[websocket] Authenticated User: "${user.username}"`);

    return next();
  } catch (err) {
    logger.error(`[websocket] Authentication exception on socket ${socket.id}: ${err.message}`);
    return next(new Error('Internal Server Error: Authentication failure'));
  }
}
