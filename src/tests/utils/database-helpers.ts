import { createInvitationHash } from '@infrastructure/utils/invitationHash.js';
import { createPublicId } from '@infrastructure/utils/id.js';
import { QueryTypes } from 'sequelize';
import type User from '@domain/entities/user.ts';
import type { Note } from '@domain/entities/note.ts';
import type UserSession from '@domain/entities/userSession.ts';
import type NoteSettings from '@domain/entities/noteSettings.ts';
import type { TeamMember } from '@domain/entities/team.ts';
import type EditorTool from '@domain/entities/editorTools.ts';
import type NoteVisit from '@domain/entities/noteVisit.js';
import { nanoid } from 'nanoid';

/**
 * Note content mock inserted if no content passed
 */
const DEFAULT_NOTE_CONTENT = {
  blocks: [
    {
      id: 'mJDq8YbvqO',
      type: 'paragraph',
      data: {
        text: 'text',
      },
    },
    {
      id: 'DeL0QehzGe',
      type: 'header',
      data: {
        text: 'fdgsfdgfdsg',
        level: 2,
      },
    },
  ],
};

/**
 * default type for note mock creation attributes
 */
type NoteMockCreationAttributes = {
  creatorId: Note['creatorId'];
  content?: Note['content'];
  publicId?: Note['publicId'];
  tools?: Note['tools'];
};

/**
 * default type for user mock creation attributes
 */
type UserMockCreationAttributes = {
  email?: User['email'];
  name?: User['name'];
  editorTools?: User['editorTools'];
};

/**
 * default type for user session mock creation attributes
 */
type UserSessionMockCreationAttributes = {
  userId: UserSession['userId'];
  refreshToker?: UserSession['refreshToken'];
  refreshTokenExpiresAt?: UserSession['refreshTokenExpiresAt'];
};

/**
 * default type for note settings mock creation attributes
 */
type NoteSettingsMockCreationAttributes = {
  noteId: NoteSettings['noteId'];
  customHostname?: NoteSettings['customHostname'];
  isPublic: NoteSettings['isPublic'];
  invitationHash?: NoteSettings['invitationHash'];
};

/**
 * default type for note team mock creation attributes
 */
type NoteTeamMockCreationAttributes = Omit<TeamMember, 'id'>;

/**
 * default type for note relation mock creation attributes
 */
type NoteRelationMockCreationAttributes = {
  noteId: Note['id'];
  parentId: Note['id'];
};

/**
 * default type for editor tool mock creation attributes
 */
type EditorToolMockCreationAttributes = Omit<EditorTool, 'id'>;

/**
 * default type for note visit mock creation attributes
 */
type NoteVisitCreationAttributes = {
  noteId: NoteVisit['noteId'];
  userId: NoteVisit['userId'];
  visitedAt?: NoteVisit['visitedAt'];
};

/**
 * class with database helper functions which are inserting mocks into database
 */
export default class DatabaseHelpers {
  private orm;

  /**
   *
   * @param orm - sequelizeOrm instance
   */
  /* eslint-disable-next-line */
  constructor(orm: any) {
    this.orm = orm;
  }

  /**
   * Executes specified sql query in test DB.
   * Might be used in tests to perform some specific database operations
   * @param sqlString - string containing sql to executein test DB
   */
  public async query(sqlString: string): Promise<unknown> {
    return await this.orm.connection.query(sqlString);
  }

  /**
   * Inserts note mock to then db
   * Automatically adds note creator to note team
   * @param note - note object which contain all info about note
   *
   * If content is not passed, it's value in database would be {}
   * If publicId is not passed, it's value in database would be created via `createPublicId()` method
   */
  public async insertNote(note: NoteMockCreationAttributes): Promise<Note> {
    const content = note.content ?? DEFAULT_NOTE_CONTENT;
    const publicId = note.publicId ?? createPublicId();
    const tools = note.tools ?? [];

    const [results, _] = await this.orm.connection.query(`INSERT INTO public.notes ("content", "creator_id", "created_at", "updated_at", "public_id", "tools")
    VALUES ('${JSON.stringify(content)}', ${note.creatorId}, CURRENT_DATE, CURRENT_DATE, '${publicId}', '${JSON.stringify(tools)}'::jsonb)
    RETURNING "id", "content", "creator_id" AS "creatorId", "public_id" AS "publicId", "created_at" AS "createdAt", "updated_at" AS "updatedAt"`,
    {
      type: QueryTypes.INSERT,
      returning: true,
    });

    const createdNote = results[0];

    await this.insertNoteTeam({
      userId: createdNote.creatorId,
      noteId: createdNote.id,
      role: 1,
    });

    return createdNote;
  }

  /**
   * Inserts user mock to then db
   * @param user - user object which contain all info about user
   *
   * If name is not passed, it's value in database would be 'CodeX'
   * If email is not passed, it's value in database would be 'test@codexmail.com'
   * If editorTools is not passed, it's value in database would be []
   */
  public async insertUser(user?: UserMockCreationAttributes): Promise<User> {
    const randomPartSize = 6;
    const randomPart = nanoid(randomPartSize);
    const editorTools = user?.editorTools ?? '[]';
    const name = user?.name ?? `CodeX-${randomPart}`;
    const email = user?.email ?? `${randomPart}@codexmail.com`;

    const [results, _] = await this.orm.connection.query(`INSERT INTO public.users ("email", "name", "created_at", "editor_tools")
    VALUES ('${email}', '${name}', CURRENT_DATE, '${editorTools}'::jsonb)
    RETURNING "id", "email", "name", "editor_tools" AS "editorTools", "created_at" AS "createdAt", "photo"`,
    {
      type: QueryTypes.INSERT,
      returning: true,
    });
    const createdUser = results[0];

    return createdUser;
  }

  /**
   * Inserts user session mock to the db
   * @param userSession - userSession object which contain all info about userSession (some info is optional)
   *
   * refreshTokenExpiresAt should be given as Postgres DATE string (e.g. `CURRENT_DATE + INTERVAL '1 day'`)
   *
   * if no refreshTokenExpiresAt passed, it's value in database would be `CURRENT_DATE + INTERVAL '1 day'`
   */
  public async insertUserSession(userSession: UserSessionMockCreationAttributes): Promise<UserSessionMockCreationAttributes> {
    const refreshTokerExpiresAt = userSession.refreshTokenExpiresAt ?? `CURRENT_DATE + INTERVAL '1 day')`;

    await this.orm.connection.query(`INSERT INTO public.user_sessions ("user_id", "refresh_token", "refresh_toker_expires_at") VALUES (${userSession.userId}, '${userSession.refreshToker}, '${refreshTokerExpiresAt}')`);

    return userSession;
  }

  /**
   * Inserts note settings mock to then db
   * @param noteSettings - noteSettings object which contain all info about noteSettings (some info is optional
   *
   * If customHostname is not passed, it's value in database would be null
   * If invitationHash is not passed, it's value in database would be calculated via `createInvitationHash()` method
   */
  public async insertNoteSetting(noteSettings: NoteSettingsMockCreationAttributes): Promise<NoteSettingsMockCreationAttributes> {
    const customHostname = noteSettings.customHostname ?? null;
    const invitationHash = noteSettings.invitationHash ?? createInvitationHash();

    noteSettings.invitationHash = invitationHash;

    await this.orm.connection.query(`INSERT INTO public.note_settings ("note_id", "custom_hostname", "is_public", "invitation_hash") VALUES (${noteSettings.noteId}, '${customHostname}', ${noteSettings.isPublic}, '${invitationHash}')`);

    return noteSettings;
  }

  /**
   * Inserts note team mock to then db
   * @param noteTeam - object that contains all info about noteTeam
   */
  public async insertNoteTeam(noteTeam: NoteTeamMockCreationAttributes): Promise<NoteTeamMockCreationAttributes> {
    await this.orm.connection.query(`INSERT INTO public.note_teams ("user_id", "note_id", "role") VALUES (${noteTeam.userId}, ${noteTeam.noteId}, ${noteTeam.role})`);

    return noteTeam;
  }

  /**
   * Inserts note relation mock to then db
   * @param noteRelation object which contain all info about noteRelation
   */
  public async insertNoteRelation(noteRelation: NoteRelationMockCreationAttributes): Promise<NoteRelationMockCreationAttributes> {
    await this.orm.connection.query(`INSERT INTO public.note_relations ("note_id", "parent_id") VALUES (${noteRelation.noteId}, ${noteRelation.parentId})`);

    return noteRelation;
  }

  /**
   * Inserts editor tool mock to then db
   * @param editorTool object which contain all info about editorTool (some info is optional)
   *
   * if no isDefault passed, then is_default would be false in database
   */
  public async insertEditorTool(editorTool: EditorToolMockCreationAttributes): Promise<EditorTool['id']> {
    const isDefault = editorTool.isDefault ?? false;

    const [result, _] = await this.orm.connection.query(`INSERT INTO public.editor_tools ("name", "title", "export_name", "source", "is_default")
    VALUES ('${editorTool.name}', '${editorTool.title}', '${editorTool.exportName}', '${JSON.stringify(editorTool.source)}', ${isDefault})
    RETURNING "id"`);

    const addedToolData = result[0];

    return String(addedToolData.id);
  }

  /**
   * Inserts note visit mock into db
   * @param visit object which contain all info about noteVisit (visitedAt is optional)
   *
   * if no visitedAt passed, then visited_at would have CLOCK_TIMESTAMP() value
   */
  public async insertNoteVisit(visit: NoteVisitCreationAttributes): Promise<NoteVisit> {
    const visitedAt = visit.visitedAt ?? 'CLOCK_TIMESTAMP()';

    const [results, _] = await this.orm.connection.query(`INSERT INTO public.note_visits ("user_id", "note_id", "visited_at")
    VALUES (${visit.userId}, ${visit.noteId}, ${visitedAt})
    RETURNING "user_id" AS "userId", "note_id" AS "noteId", "visited_at" AS "visitedAt"`,
    {
      type: QueryTypes.INSERT,
      returning: true,
      omitNull: true,
    });

    const createdVisit = results[0];

    return createdVisit;
  }

  /**
   * Truncates all tables and restarts all autoincrement sequences
   */
  public async truncateTables(): Promise<void> {
    await this.orm.connection.query(`DO $$
    DECLARE
      -- table iterator
      tbl RECORD;
      -- sequence iterator
      seq RECORD;
    BEGIN
      -- truncate all tables (except migrations) in database
      FOR tbl IN
        SELECT * FROM information_schema.tables
        WHERE table_name!= 'migrations'
        AND table_schema= 'public'
        AND table_type= 'BASE TABLE'
      LOOP
        EXECUTE format('TRUNCATE public.%s CASCADE', tbl.table_name);
      END LOOP;

      -- restart all sequences
      -- (autoincrement should start with 1 when test-data is truncated)
      FOR seq IN
        SELECT * FROM information_schema.sequences
        WHERE sequence_schema= 'public'
      LOOP
        EXECUTE format('ALTER sequence %s RESTART WITH 1', seq.sequence_name);
      END LOOP;
    END $$ LANGUAGE plpgsql;`);

    /** Insert default tools */
    await this.orm.connection.query(`
      INSERT INTO public.editor_tools (name, title, export_name, source, is_default)
      VALUES ('header', 'Heading', 'Header', '{"cdn": "https://cdn.jsdelivr.net/npm/@editorjs/header@2.8.1/dist/header.umd.min.js"}'::json, true);
    `);

    await this.orm.connection.query(`
      INSERT INTO public.editor_tools (name, title, export_name, source, is_default)
      VALUES ('paragraph', 'Paragraph', 'Paragraph', '{"cdn": "https://cdn.jsdelivr.net/npm/@editorjs/paragraph@2.11.3/dist/paragraph.umd.min.js"}'::json, true);
    `);

    await this.orm.connection.query(`
      INSERT INTO public.editor_tools (name, title, export_name, source, is_default)
      VALUES ('list', 'List', 'List', '{"cdn": "https://cdn.jsdelivr.net/npm/@editorjs/list@1.9.0/dist/list.umd.min.js"}'::json, true);
    `);
  }
};
