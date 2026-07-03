import cron from 'node-cron';
import fs from 'fs-extra';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const startScheduler = () => {
  cron.schedule('0 */6 * * *', async () => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.ensureDir('backups');
    await fs.copy(config.databasePath, `backups/database-${stamp}.json`).catch(() => {});
    logger.info('Database backup otomatis dibuat');
  });
};
