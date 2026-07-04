import http from 'http';
import bcrypt from 'bcryptjs';
import { buildApp } from './app.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';
import { UserModel } from '../models/UserModel.js';

/**
 * Seed default owner user if no API users exist.
 */
async function seedDefaultOwner() {
  try {
    const users = await UserModel.findAll();
    if (users.length === 0) {
      const defaultUsername = 'admin';
      const defaultPassword = 'adminpassword123';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);
      
      const owner = await UserModel.create({
        username: defaultUsername,
        passwordHash,
        role: 'owner',
        email: 'owner@wabot.local'
      });

      // Generate initial API key for the owner
      const apiKey = `wab_owner_${Math.random().toString(36).substring(2, 15)}`;
      await UserModel.setApiKey(owner.id, apiKey);

      logger.info('=== SEED API USER SUCCESS ===', { category: 'api' });
      logger.info(`Default Username: ${defaultUsername}`, { category: 'api' });
      logger.info(`Default Password: ${defaultPassword}`, { category: 'api' });
      logger.info(`Default API Key: ${apiKey}`, { category: 'api' });
      logger.info('Please change password immediately via API / User management.', { category: 'api' });
    }
  } catch (error) {
    logger.error('Failed to seed default owner user:', error.message);
  }
}

/**
 * Start REST API Gateway Server.
 * @param {import('../manager/BotManager.js').BotManager} botManager
 */
export async function startApiServer(botManager) {
  const app = buildApp(botManager);
  const port = config.apiPort || 3001;
  const server = http.createServer(app);

  await seedDefaultOwner();

  server.listen(port, () => {
    logger.success?.(`REST API Gateway is running on http://localhost:${port}`, { category: 'api' }) || 
      logger.info(`REST API Gateway is running on port ${port}`);
    logger.info(`Swagger docs available at http://localhost:${port}/api/docs`, { category: 'api' });
  });

  // Graceful shutdown
  const handleShutdown = () => {
    logger.info('Shutting down REST API Gateway...');
    server.close(() => {
      logger.info('REST API Gateway stopped.');
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);

  return server;
}
