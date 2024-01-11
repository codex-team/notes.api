import pg, { type ClientConfig } from 'pg';
import { migrate } from 'postgres-migrations';
import logger from '@infrastructure/logging/index.js';


/**
 * Connects to the database and runs migrations
 *
 * @param migrationsPath - path to migrations files
 * @param dsn - database connection string
 */
export async function runTenantMigrations(migrationsPath: string, dsn: string ): Promise<void> {
  logger.info('🚚 Running migrations...');

  const dbConfig: ClientConfig =  {
    connectionString: dsn,
    connectionTimeoutMillis: 10_000,
    options: '-c search_path=public',
  };

  const client = new pg.Client(dbConfig);

  try {
    await client.connect();
    const result = await migrate({ client }, migrationsPath);

    if (result.length === 0) {
      logger.info('✅ Nothing to migrate');
    } else {
      result.forEach((migration) => {
        logger.info(`✅ ${migration.name} migrated successfully`);
      });
    }
  } finally {
    await client.end();
  }
}
