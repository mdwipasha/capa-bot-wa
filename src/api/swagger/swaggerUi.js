import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';

const router = Router();

const swaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { background-color: #1a1a2e; }
    .swagger-ui .topbar .topbar-wrapper .link span { color: #e94560; }
    .swagger-ui .info .title { color: #e94560; }
    .swagger-ui .scheme-container { background: #16213e; padding: 15px; }
  `,
  customSiteTitle: 'WhatsApp Bot API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
};

// Serve raw OpenAPI JSON spec
router.get('/api/docs/spec.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Serve Swagger UI
router.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

export default router;
