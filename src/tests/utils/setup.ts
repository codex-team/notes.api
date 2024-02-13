import path from 'path';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

import { insertData } from './insert-data';
import { initORM, init as initRepositories } from '@repository/index.js';
import { init as initDomainServices } from '@domain/index.js';
import config from '@infrastructure/config/index.js';
import { runTenantMigrations } from '@repository/storage/postgres/migrations/migrate';
import API from '@presentation/index.js';

import { beforeAll, afterAll} from 'vitest';
import type Api from '@presentation/api.interface';

// import { readFileSync } from 'fs';

/**
 * Tests setup maximum duration.
 * Added as default 10000 is not enough
 */
const TIMEOUT = 200000;

declare global {
  /**
   *
   */
  /* eslint-disable-next-line no-var */
  // var truncateTableScript: string;

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
     * @param sql - string containing sql to executein test DB
     */
    query: (sql: string) => Promise<unknown>;

    /**
     * Execute sql query, that creates new note in database with specified data
     *
     * @param creatorId - id of creator user
     * @param content - optional content of the note
     */
    insertNote: (creatorId: number, content?: JSON) => Promise<unknown>;

    insertUser: () => Promise<unknown>;

    insertNoteSetting: () => Promise<unknown>;

    insertEditorTool: () => Promise<unknown>;

    insertNoteRelation: () => Promise<unknown>;

    insertNoteTeam: () => Promise<unknown>;

    insertUserSession: () => Promise<unknown>;
  };
}

/**
 * Path to migrations files
 */
const migrationsPath = path.join(process.cwd(), 'migrations', 'tenant');

let postgresContainer: StartedPostgreSqlContainer | undefined;

beforeAll(async () => {
  // global.truncateTableScript = readFileSync('../sql-tools/restart-database-data.txt', 'utf-8');

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

  global.auth = (userId: number) => {
    return domainServices.authService.signAccessToken({ id : userId });
  };

  global.db = {
    query: async (sqlString: string) => {
      return await orm.connection.query(sqlString);
    },

    insertNote: async (creatorId: number, content?: JSON) => {
      return await orm.connection.query(`INSERT INTO public.notes ("content", "creator_id", "created_at", "updated_at") VALUES ('${content}', ${creatorId} CURRENT_DATE)`);
    },

    insertUser: async () => {
    },

    insertUserSession: async () => {
    },

    insertNoteSetting: async () => {
    },

    insertNoteTeam: async () => {
    },

    insertNoteRelation: async () => {
    },

    insertEditorTool: async () => {
    },
  };
}, TIMEOUT);

//
// beforeEach(async () => {
// // script to truncate all tables and restart all sequences for inserted data to start with id
//
// await global.db.query(global.truncateTableScript);
// });
//

afterAll(async () => {
  await postgresContainer?.stop();
  delete global.api;
});
