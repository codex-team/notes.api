import path from 'path';
import config from './../../../../infrastructure/config/index.js';
import { runTenantMigrations } from './migrate.js';
import process from 'process';

/**
 * Path to migration files
 */
const migrationsPath = path.join(process.cwd(), 'migrations', 'tenant');

void (async () => {
  /**
   * Runs migrations
   */
  await runTenantMigrations(migrationsPath, config.database.dsn);
})();
