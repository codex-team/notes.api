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
     * @param note - note object which contain all info about note (some info is optional)
     */
    insertNote: (note: {creatorId: number, content?: JSON, publicId: string}) => Promise<unknown>;

    /**
     * Execute sql query, that creates new user in database with specified data
     *
     * @param user - user object which contain all info about user (some info is optional)
     *
     * if no editorTools passed, then editor_tools would be []] in database
     */
    insertUser: (user: {email: string, name: string, editorTools?: [string]}) => Promise<unknown>;

    /**
     * Execute sql query, that creates new userSession in database with specified data
     *
     * @param userSession - userSession object which contain all info about userSession (some info is optional)
     *
     * refreshTokenExpiresAt should be given as Postgres DATE string (e.g. `CURRENT_DATE + INTERVAL '1 day'`)
     *
     * if no refreshTokenExpiresAt passed, then it would be `CURRENT_DATE + INTERVAL '1 day'`
     */
    insertUserSession: (userSession: {userId: number, refreshToker: string, refreshTokenExpiresAt?: string}) => Promise<unknown>;

    /**
     * Execute sql query, that creates new noteSettings in database with specified data
     *
     * @param noteSettings - noteSettings object which contain all info about noteSettings (some info is optional
     *
     * if no custoHostname passed, then custom_hostname would be null in database
     */
    insertNoteSetting: (noteSettings: {noteId: number, customHostname?: string, isPublic: boolean, invitationHash: string}) => Promise<unknown>;

    /**
     * Execute sql query, that creates new noteTeam in database with specified data
     *
     * @param noteTeam - noteTam object which contain all info about noteTeam
     */
    insertNoteTeam: (noteTeam: {userId: number, noteId: number, role: number}) => Promise<unknown>;

    /**
     * Execute sql query, that creates new noteRelation in database with specified data
     *
     * @param noteRelation object which contain all info about noteRelation
     */
    insertNoteRelation: (noteRelation: {noteId: number, parentId: number}) => Promise<unknown>;

    /**
     * Execute sql query, that creates new editorTool in database with specified data
     *
     * @param editorTool object which contain all info about editorTool (some info is optional)
     *
     * if no isDefault passed, then is_default would be false in database
     */
    insertEditorTool: (editorTool: {name: string, title: string, exportName: string, source: JSON, isDefault?: boolean}) => Promise<unknown>;
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

    insertNote: async (note: {creatorId: number, content?: JSON, publicId: string}) => {
      const content = note.content ?? '{}';

      return await orm.connection.query(`INSERT INTO public.notes ("content", "creator_id", "created_at", "updated_at", "public_id") VALUES ('${content}', ${note.creatorId}, CURRENT_DATE, CURRENT_DATE, '${note.publicId}')`);
    },

    insertUser: async (user: {email: string, name: string, editorTools?: [string]}) => {
      // editor tools could be `undefined` because they are optional, but db needs `null` property in this case
      const editorTools = user.editorTools ?? '[]';

      return await orm.connection.query(`INSERT INTO public.users ("email", "name", "created_at", "editor_tools") VALUES ('${user.email}', '${user.name}', CURRENT_DATE, array${editorTools}::text[])`);
    },

    insertUserSession: async (userSession: {userId: number, refreshToker: string, refreshTokenExpiresAt?: string}) => {
      // refreshTokerExpiresAt is optional so it would be 'CURRENT_DATE + INTERVAL(1 DAY)' by default
      const refreshTokerExpiresAt = userSession.refreshTokenExpiresAt ?? `CURRENT_DATE + INTERVAL '1 day')`;

      return await orm.connection.query(`INSERT INTO public.user_sessions ("user_id", "refresh_token", "refresh_toker_expires_at") VALUES (${userSession.userId}, '${userSession.refreshToker}, '${refreshTokerExpiresAt}')`);
    },

    insertNoteSetting: async (noteSettings: {noteId: number, customHostname?: string, isPublic: boolean, invitationHash: string}) => {
      // custom hostname could be `undefined` because it is optional, but db needs `null` property in this case
      const customHostname = noteSettings.customHostname ?? null;

      return await orm.connection.query(`INSERT INTO public.note_settings ("note_id", "custom_hostname", "is_public", "invitation_hash") VALUES (${noteSettings.noteId}, '${customHostname}', ${noteSettings.isPublic}, '${noteSettings.invitationHash}')`);
    },

    insertNoteTeam: async (noteTeam: {userId: number, noteId: number, role: number}) => {
      return await orm.connection.query(`INSERT INTO public.note_teams ("user_id", "note_id", "role") VALUES (${noteTeam.userId}, ${noteTeam.noteId}, ${noteTeam.role})`);
    },

    insertNoteRelation: async (noteRelation: {noteId: number, parentId: number}) => {
      return await orm.connection.query(`INSERT INTO public.note_relations ("note_id", "parent_id") VALUES (${noteRelation.noteId}, ${noteRelation.parentId})`);
    },

    insertEditorTool: async (editorTool: {name: string, title: string, exportName: string, source: JSON, isDefault?: boolean }) => {
      // custom hostname could be `undefined` because it is optional, but db needs `null` property in this case
      const isDefault = editorTool.isDefault ?? null;

      return await orm.connection.query(`INSERT INTO public.editor_tools ("name", "title", "export_name", "source", "is_default") VALUES ('${editorTool.name}', '${editorTool.title}', '${editorTool.exportName}', '${editorTool.exportName}', ${isDefault}')`);
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
