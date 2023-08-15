import pg, { type ClientConfig } from 'pg';
import { migrate } from 'postgres-migrations';
import config from './../../../../infrastructure/config/index.js';

/**
 * Connects to the database and runs migrations
 *
 * @param migrationsPath - path to migrations files
 */
export async function runTenantMigrations(migrationsPath: string): Promise<void> {
  console.log('🚚 Running migrations...');

  const dbConfig: ClientConfig =  {
    connectionString: config.database.dsn,
    connectionTimeoutMillis: 10_000,
    options: '-c search_path=public',
  };

  const client = new pg.Client(dbConfig);

  try {
    await client.connect();
    const result = await migrate({ client }, migrationsPath);

    if (result.length === 0) {
      console.log('✅ Nothing to migrate');
    } else {
      result.forEach((migration) => {
        console.log(`✅ ${migration.name} migrated successfully`);
      });
    }
  } finally {
    await client.end();
  }
}
