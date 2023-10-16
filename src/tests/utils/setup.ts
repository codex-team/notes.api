import path from 'path';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

import { insertData } from './insert-data';
import { initORM, init as initRepositories } from '@repository/index.js';
import { init as initDomainServices } from '@domain/index.js';
import config from '@infrastructure/config/index.js';
import { runTenantMigrations } from '@repository/storage/postgres/migrations/migrate';
import API from '@presentation/http/http-server.js';

import { beforeAll, afterAll } from 'vitest';

declare global {
  /* eslint-disable-next-line no-var */
  var api: API | undefined;
}

/**
 * Path to migrations files
 */
const migrationsPath = path.join(process.cwd(), 'migrations', 'tenant');

let postgresContainer: StartedPostgreSqlContainer | undefined;

beforeAll(async () => {
  postgresContainer = await new PostgreSqlContainer().withUsername('postgres')
    .start();

  const orm = await initORM({ dsn: postgresContainer.getConnectionUri() });
  const repositories = await initRepositories(orm);
  const domainServices = initDomainServices(repositories, config);
  const api = await API.init(config.httpApi, domainServices);

  await runTenantMigrations(migrationsPath, postgresContainer.getConnectionUri());
  await insertData(orm);

  global.api = api;
});

afterAll(async () => {
  await postgresContainer?.stop();
  delete global.api;
});