import { createInvitationHash } from '@infrastructure/utils/invitationHash';
import { QueryTypes } from 'sequelize';

/**
 * default type for note
 */
type note = {
  creatorId: number,
  content?: JSON,
  publicId: string,
};

interface createdNote extends note {
  id: number,
};

/**
 * default type for user
 */
type user = {
  email: string,
  name: string,
  editorTools?: [string],
};

interface createdUser extends user {
  id: number,
}

/**
 * default type for userSession
 */
type userSession = {
  userId: number,
  refreshToker: string,
  refreshTokenExpiresAt?: string,
};

/**
 * default type for note settings
 */
type noteSettings = {
  noteId: number,
  customHostname?: string,
  isPublic: boolean,
  invitationHash?: string,
};

/**
 * default type for note team
 */
type noteTeam = {
  userId: number,
  noteId: number,
  role: number,
};

/**
 * default type for note relation
 */
type noteRelation = {
  noteId: number,
  parentId: number,
};

/**
 * default type for editor tool
 */
type editorTool = {
  name: string,
  title: string,
  exportName: string,
  source: JSON,
  isDefault: boolean,
};

/**
 * class of db helpers
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
   *
   * @param sqlString - string containing sql to executein test DB
   */
  public async query(sqlString: string): Promise<unknown> {
    return await this.orm.connection.query(sqlString);
  }

  /**
   * Inserts note mock to then db
   *
   * @param note - note object which contain all info about note (some info is optional)
   */
  public async insertNote(note: note): Promise<createdNote> {
    const content = note.content ?? '{}';

    const response = await this.orm.connection.query(`INSERT INTO public.notes ("content", "creator_id", "created_at", "updated_at", "public_id") 
    VALUES ('${content}', ${note.creatorId}, CURRENT_DATE, CURRENT_DATE, '${note.publicId}') 
    RETURNING "id", "content", "creator_id", "public_id"`,
    {
      type: QueryTypes.INSERT,
      returning: true,
    });

    const createdNote = response[0][0];

    createdNote['publicId'], createdNote['creatorId'] = createdNote['public_id'], createdNote['creator_id'];
    delete createdNote['creator_id'], createdNote['public_id'];

    return createdNote;
  }

  /**
   * Inserts user mock to then db
   *
   * @param user - user object which contain all info about user (some info is optional)
   *
   * If editorTools is not passed, the editor_tools database will have []
   */
  public async insertUser(user: user): Promise<createdUser> {
    const editorTools = user.editorTools ?? '[]';

    const response = await this.orm.connection.query(`INSERT INTO public.users ("email", "name", "created_at", "editor_tools") 
    VALUES ('${user.email}', '${user.name}', CURRENT_DATE, array${editorTools}::text[])
    RETURNING id, email, name, editor_tools`,
    {
      type: QueryTypes.INSERT,
      returning: true,
    });
    const createdUser = response[0][0];

    createdUser['editorTools'] = createdUser['editor_tools'];
    delete createdUser['editor_tools'];

    return createdUser;
  }

  /**
   * Inserts user session mock to then db
   *
   * @param userSession - userSession object which contain all info about userSession (some info is optional)
   *
   * refreshTokenExpiresAt should be given as Postgres DATE string (e.g. `CURRENT_DATE + INTERVAL '1 day'`)
   *
   * if no refreshTokenExpiresAt passed, then it would be `CURRENT_DATE + INTERVAL '1 day'`
   */
  public async insertUserSession(userSession: userSession): Promise<userSession> {
    const refreshTokerExpiresAt = userSession.refreshTokenExpiresAt ?? `CURRENT_DATE + INTERVAL '1 day')`;

    await this.orm.connection.query(`INSERT INTO public.user_sessions ("user_id", "refresh_token", "refresh_toker_expires_at") VALUES (${userSession.userId}, '${userSession.refreshToker}, '${refreshTokerExpiresAt}')`);

    return userSession;
  }

  /**
   * Inserts note settings mock to then db
   *
   * @param noteSettings - noteSettings object which contain all info about noteSettings (some info is optional
   *
   * If customHostname is not passed, custom_hostname will be set to null in the database
   */
  public async insertNoteSetting(noteSettings: noteSettings): Promise<noteSettings> {
    const customHostname = noteSettings.customHostname ?? null;
    const invitationHash = noteSettings.invitationHash ?? createInvitationHash();

    noteSettings.invitationHash = invitationHash;

    await this.orm.connection.query(`INSERT INTO public.note_settings ("note_id", "custom_hostname", "is_public", "invitation_hash") VALUES (${noteSettings.noteId}, '${customHostname}', ${noteSettings.isPublic}, '${invitationHash}')`);

    return noteSettings;
  }

  /**
   * Inserts note team mock to then db
   *
   * @param noteTeam - noteTam object which contain all info about noteTeam
   */
  public async insertNoteTeam(noteTeam: noteTeam): Promise<noteTeam> {
    await this.orm.connection.query(`INSERT INTO public.note_teams ("user_id", "note_id", "role") VALUES (${noteTeam.userId}, ${noteTeam.noteId}, ${noteTeam.role})`);

    return noteTeam;
  }

  /**
   * Inserts note relation mock to then db
   *
   * @param noteRelation object which contain all info about noteRelation
   */
  public async insertNoteRelation(noteRelation: noteRelation): Promise<noteRelation> {
    await this.orm.connection.query(`INSERT INTO public.note_relations ("note_id", "parent_id") VALUES (${noteRelation.noteId}, ${noteRelation.parentId})`);

    return noteRelation;
  }

  /**
   * Inserts editor tool mock to then db
   *
   * @param editorTool object which contain all info about editorTool (some info is optional)
   *
   * if no isDefault passed, then is_default would be false in database
   */
  public async insertEditorTool(editorTool: editorTool): Promise<editorTool> {
    const isDefault = editorTool.isDefault ?? null;

    await this.orm.connection.query(`INSERT INTO public.editor_tools ("name", "title", "export_name", "source", "is_default") VALUES ('${editorTool.name}', '${editorTool.title}', '${editorTool.exportName}', '${editorTool.exportName}', ${isDefault}')`);

    return editorTool;
  }

  /**
   * Truncates all tables and restarts all autoincrement sequences
   */
  public async truncateTables(): Promise<unknown> {
    return await this.orm.connection.query(`DO $$
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
  }
};
