import { Router } from 'express';
import { ConfigController } from '../controllers/ConfigController.js';
import { validateConfigUpdate, validateConfigSet, validateConfigImport, validateConfigReset } from '../validators/configValidators.js';

/**
 * Configuration Manager API Routes
 *
 * GET    /config                  → Get all config
 * GET    /config/categories       → Get available categories with schemas
 * GET    /config/export           → Export config as JSON
 * GET    /config/:category        → Get config by category
 * GET    /config/:category/:key   → Get single key
 * PUT    /config/:category        → Bulk update category
 * PUT    /config/:category/:key   → Set single key
 * DELETE /config/:category/:key   → Delete single key (reset to default)
 * POST   /config/reset            → Reset config (all or specific category)
 * POST   /config/import           → Import config from JSON
 */
export default function configRoutes() {
  const router = Router();

  // ─── Read Operations ─────────────────────────
  router.get('/', ConfigController.getAll);
  router.get('/categories', ConfigController.getCategories);
  router.get('/export', ConfigController.exportConfig);
  router.get('/:category', ConfigController.getCategory);
  router.get('/:category/:key', ConfigController.getKey);

  // ─── Write Operations ────────────────────────
  router.put('/:category', validateConfigUpdate, ConfigController.updateCategory);
  router.put('/:category/:key', validateConfigSet, ConfigController.setKey);

  // ─── Delete Operations ───────────────────────
  router.delete('/:category/:key', ConfigController.deleteKey);

  // ─── Special Operations ──────────────────────
  router.post('/reset', validateConfigReset, ConfigController.resetConfig);
  router.post('/import', validateConfigImport, ConfigController.importConfig);

  return router;
}
