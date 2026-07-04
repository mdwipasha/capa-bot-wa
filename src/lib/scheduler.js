import { logger } from '../utils/logger.js';

export const startScheduler = async (schedulerManager) => {
  if (!schedulerManager) {
    logger.warn('Scheduler Manager not provided to startScheduler. Backup task will not be registered.');
    return;
  }

  try {
    const jobs = await schedulerManager.getJobs();
    const backupJobExists = jobs.some(
      (job) => job.jobType === 'Auto Backup' || job.name === 'Auto Backup DB'
    );

    if (!backupJobExists) {
      await schedulerManager.createJob({
        id: 'auto-backup-db-job',
        name: 'Auto Backup DB',
        description: 'Automated database backup every 6 hours',
        createdBy: 'system',
        cron: '0 */6 * * *',
        jobType: 'Auto Backup',
        timezone: 'Asia/Jakarta',
        retry: true,
        maxRetry: 3
      });
      logger.info('Registered default Auto Backup DB job in Scheduler Manager');
    }
  } catch (err) {
    logger.error('Failed to register default backup task in Scheduler Manager', err);
  }
};
