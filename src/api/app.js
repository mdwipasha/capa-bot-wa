import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { corsMiddleware } from './middleware/cors.js';
import { requestId } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { ApiResponse } from './response/ApiResponse.js';
import { buildV1Router } from './v1/index.js';
import swaggerRouter from './swagger/swaggerUi.js';
import { SystemController } from './v1/controllers/SystemController.js';

/**
 * Build Express application.
 * @param {import('../manager/BotManager.js').BotManager} botManager
 * @returns {import('express').Application}
 */
export function buildApp(botManager) {
  const app = express();

  // ──────────────────────────────────────────────
  // Security & Performance Middleware
  // ──────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false, // disabled so Swagger UI works
    crossOriginEmbedderPolicy: false
  }));
  app.use(compression());
  app.use(corsMiddleware);

  // ──────────────────────────────────────────────
  // Request parsing
  // ──────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ──────────────────────────────────────────────
  // Request ID + Logger
  // ──────────────────────────────────────────────
  app.use(requestId);

  // Attach res.success(), res.created(), res.fail() helpers
  app.use((req, res, next) => {
    ApiResponse.attach(res);
    next();
  });

  app.use(requestLogger);

  // ──────────────────────────────────────────────
  // Global rate limiting
  // ──────────────────────────────────────────────
  app.use('/api', globalLimiter);

  // ──────────────────────────────────────────────
  // Public health check (no auth, no rate limit)
  // ──────────────────────────────────────────────
  const systemCtrl = new SystemController(botManager);
  app.get('/health', (req, res, next) => systemCtrl.health(req, res, next));

  // ──────────────────────────────────────────────
  // Swagger UI
  // ──────────────────────────────────────────────
  app.use(swaggerRouter);

  // ──────────────────────────────────────────────
  // API v1
  // ──────────────────────────────────────────────
  app.use('/api/v1', buildV1Router(botManager));

  // ──────────────────────────────────────────────
  // API v2 — same as v1 for now, add breaking changes here later
  // ──────────────────────────────────────────────
  app.use('/api/v2', buildV1Router(botManager));

  // ──────────────────────────────────────────────
  // API root info
  // ──────────────────────────────────────────────
  app.get('/api', (req, res) => {
    return res.json({
      name: 'WhatsApp Bot API Gateway',
      versions: ['v1', 'v2'],
      docs: '/api/docs',
      health: '/health',
      timestamp: new Date().toISOString()
    });
  });

  // ──────────────────────────────────────────────
  // Error handling (must be last)
  // ──────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
