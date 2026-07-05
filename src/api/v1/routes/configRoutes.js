import { Router } from 'express';
import { ConfigController } from '../controllers/ConfigController.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/authorize.js';
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

  router.use(authenticate);

  // ─── Read Operations (requires config.view) ─────────────────────────
  router.get('/', requirePermission('config.view'), ConfigController.getAll);
  router.get('/categories', requirePermission('config.view'), ConfigController.getCategories);
  router.get('/export', requirePermission('config.view'), ConfigController.exportConfig);
  router.get('/:category', requirePermission('config.view'), ConfigController.getCategory);
  router.get('/:category/:key', requirePermission('config.view'), ConfigController.getKey);

  // ─── Write Operations (requires config.edit) ────────────────────────
  router.put('/:category', requirePermission('config.edit'), validateConfigUpdate, ConfigController.updateCategory);
  router.put('/:category/:key', requirePermission('config.edit'), validateConfigSet, ConfigController.setKey);

  // ─── Delete Operations (requires config.edit) ───────────────────────
  router.delete('/:category/:key', requirePermission('config.edit'), ConfigController.deleteKey);

  // ─── Special Operations (requires config.edit) ──────────────────────
  router.post('/reset', requirePermission('config.edit'), validateConfigReset, ConfigController.resetConfig);
  router.post('/import', requirePermission('config.edit'), validateConfigImport, ConfigController.importConfig);

  return router;
}
