import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../../config/env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp Bot REST API',
      version: '1.0.0',
      description: `
# WhatsApp Bot API Gateway

REST API profesional sebagai satu-satunya pintu masuk untuk Dashboard, Mobile App, CLI, dan integrasi pihak ketiga.

## Authentication

API mendukung 3 metode autentikasi:

- **JWT Bearer Token**: \`Authorization: Bearer <token>\`
- **API Key**: \`X-API-Key: <key>\`
- **Session Token**: \`X-Session-Token: <token>\`

## Rate Limiting

- Global: 200 req/15 menit (per IP)
- Auth: 10 req/15 menit (per IP)
- Message: 60 req/menit (per user)
- API Key: 1000 req/15 menit (per key)

## Response Format

Semua endpoint mengembalikan format standar:

\`\`\`json
{
  "success": true,
  "message": "OK",
  "code": 200,
  "data": {},
  "error": null,
  "timestamp": "2026-07-04T00:00:00.000Z",
  "requestId": "uuid-v4"
}
\`\`\`

## Roles

| Role | Level |
|------|-------|
| owner | 4 (full access) |
| admin | 3 |
| operator | 2 |
| developer | 1 |
| viewer | 0 (read-only) |
      `,
      contact: {
        name: 'WhatsApp Bot Support',
        email: 'support@wabot.local'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.apiPort || 3001}/api/v1`,
        description: 'Development (v1)'
      },
      {
        url: `http://localhost:${config.apiPort || 3001}/api/v2`,
        description: 'Development (v2)'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key'
        },
        SessionTokenAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Session-Token',
          description: 'Session Token'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            code: { type: 'integer' },
            data: { type: 'object', nullable: true },
            error: { type: 'object', nullable: true },
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string', format: 'uuid' }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' }
          }
        },
        Bot: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            phoneNumber: { type: 'string' },
            displayName: { type: 'string' },
            connected: { type: 'boolean' },
            status: { type: 'string' },
            lastActive: { type: 'string' },
            uptime: { type: 'number' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['owner', 'admin', 'operator', 'developer', 'viewer'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            lastLogin: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        Plugin: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            enabled: { type: 'boolean' },
            version: { type: 'string' }
          }
        },
        QueueJob: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            queueName: { type: 'string' },
            status: { type: 'string', enum: ['Waiting', 'Running', 'Completed', 'Failed', 'Cancelled', 'Retrying'] },
            progress: { type: 'integer' },
            retryCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        SchedulerJob: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            schedule: { type: 'string' },
            task: { type: 'string' },
            status: { type: 'string', enum: ['active', 'paused', 'disabled', 'completed'] },
            lastRun: { type: 'string', format: 'date-time', nullable: true },
            nextRun: { type: 'string', format: 'date-time', nullable: true }
          }
        }
      }
    },
    security: [
      { BearerAuth: [] },
      { ApiKeyAuth: [] }
    ],
    tags: [
      { name: 'Auth', description: 'Autentikasi dan manajemen token' },
      { name: 'Bots', description: 'Manajemen bot WhatsApp' },
      { name: 'Plugins', description: 'Manajemen plugin' },
      { name: 'Commands', description: 'Manajemen command' },
      { name: 'Sessions', description: 'Manajemen sesi WhatsApp' },
      { name: 'Messages', description: 'Kirim dan broadcast pesan' },
      { name: 'Queue', description: 'Manajemen antrian pekerjaan' },
      { name: 'Scheduler', description: 'Manajemen scheduled jobs' },
      { name: 'System', description: 'Info sistem dan health check' },
      { name: 'Users', description: 'Manajemen pengguna API' }
    ]
  },
  apis: ['./src/api/v1/routes/*.js', './src/api/v1/controllers/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);
