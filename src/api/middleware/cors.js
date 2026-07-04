import cors from 'cors';
import { config } from '../../config/env.js';

const allowedOrigins = config.corsOrigins || ['*'];

/**
 * CORS middleware — configurable origins from env.
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'X-Session-Token'
  ],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400 // preflight cache 24h
});
