import path from 'path';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

import { insertData } from './insert-data';
import { initORM, init as initRepositories } from '@repository/index.js';
import { init as initDomainServices } from '@domain/index.js';
import config from '@infrastructure/config/index.js';
import { runTenantMigrations } from '@repository/storage/postgres/migrations/migrate';
import API from '@presentation/index.js';

import { beforeAll, afterAll } from 'vitest';
import type Api from '@presentation/api.interface';

/**
 * Tests setup maximum duration.
 * Added as default 10000 is not enough
 */
const TIMEOUT = 200000;

declare global {
  /**
   * Globally exposed variable, containing reference to http server object.
   * Is accessed as 'global.server' in tests
   */
  /* eslint-disable-next-line no-var */
  var api: Api | undefined;

  /**
   * Globally exposed method for creating accessToken using id
   * Is accessed as 'global.server' in tests
   *
<<<<<<< HEAD
   * @param userId - id of the user that will be considered the author of the request
   * @returns accessToken for authorization
   */
  function auth(userId: number): string;

  /* eslint-disable-next-line no-var */
  var db: {
    /**
     * Executes specified sql query in test DB.
     * Might be used in tests to perform some specific database operations
     *
     * @param sql - string containing sql to execute in test DB
     */
    query: (sql: string) => Promise<unknown>;
  };
=======
   * @param id - id for making accessToken
   * @returns accessToken for authorization
   */
  function auth(id: number) : string;
>>>>>>> 023a509cd58ac661142c392596df8e9a10c65342
}

/**
 * Path to migrations files
 */
const migrationsPath = path.join(process.cwd(), 'migrations', 'tenant');

let postgresContainer: StartedPostgreSqlContainer | undefined;

beforeAll(async () => {
  postgresContainer = await new PostgreSqlContainer()
    .withUsername('postgres')
    .start();

  const orm = await initORM({ dsn: postgresContainer.getConnectionUri() });
  const repositories = await initRepositories(orm);
  const domainServices = initDomainServices(repositories, config);
  const api = new API(config.httpApi);

  await api.init(domainServices);

  await runTenantMigrations(migrationsPath, postgresContainer.getConnectionUri());
  await insertData(orm);

  global.api = api;
<<<<<<< HEAD

  global.auth = (userId: number) => {
    return domainServices.authService.signAccessToken({ id : userId });
  };

  global.db = {
    query: async (sqlString: string) => {
      return await orm.connection.query(sqlString);
    },
=======
  global.auth = (id: number) => {
    return domainServices.authService.signAccessToken({ id : id });
>>>>>>> 023a509cd58ac661142c392596df8e9a10c65342
  };
}, TIMEOUT);

afterAll(async () => {
  await postgresContainer?.stop();
  delete global.api;
});
