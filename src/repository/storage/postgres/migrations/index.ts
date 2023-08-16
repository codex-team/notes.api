import path from 'path';
import { runTenantMigrations } from './migrate.js';

/**
 * Path to migration files
 */
const migrationsPath = path.join(process.cwd(), 'migrations', 'tenant');

void (async () => {
  /**
   * Runs migrations
   */
  await runTenantMigrations(migrationsPath);
})();
