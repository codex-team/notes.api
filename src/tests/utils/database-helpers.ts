/**
 * class of db helpers
 */
export default class dbHelpers {
  public orm;
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
  public async insertNote(note: {creatorId: number, content?: JSON, publicId: string}): Promise<unknown> {
    const content = note.content ?? '{}';

    return await this.orm.connection.query(`INSERT INTO public.notes ("content", "creator_id", "created_at", "updated_at", "public_id") VALUES ('${content}', ${note.creatorId}, CURRENT_DATE, CURRENT_DATE, '${note.publicId}')`);
  }

  /**
   * Inserts user mock to then db
   *
   * @param user - user object which contain all info about user (some info is optional)
   *
   * if no editorTools passed, then editor_tools would be []] in database
   */
  public async insertUser(user: {email: string, name: string, editorTools?: [string]}): Promise<unknown> {
    const editorTools = user.editorTools ?? '[]';

    return await this.orm.connection.query(`INSERT INTO public.users ("email", "name", "created_at", "editor_tools") VALUES ('${user.email}', '${user.name}', CURRENT_DATE, array${editorTools}::text[])`);
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
  public async insertUserSession(userSession: {userId: number, refreshToker: string, refreshTokenExpiresAt?: string}): Promise<unknown> {
    const refreshTokerExpiresAt = userSession.refreshTokenExpiresAt ?? `CURRENT_DATE + INTERVAL '1 day')`;

    return await this.orm.connection.query(`INSERT INTO public.user_sessions ("user_id", "refresh_token", "refresh_toker_expires_at") VALUES (${userSession.userId}, '${userSession.refreshToker}, '${refreshTokerExpiresAt}')`);
  }

  /**
   * Inserts note settings mock to then db
   *
   * @param noteSettings - noteSettings object which contain all info about noteSettings (some info is optional
   *
   * if no custoHostname passed, then custom_hostname would be null in database
   */
  public async insertNoteSetting(noteSettings: {noteId: number, customHostname?: string, isPublic: boolean, invitationHash: string}): Promise<unknown> {
    const customHostname = noteSettings.customHostname ?? null;

    return await this.orm.connection.query(`INSERT INTO public.note_settings ("note_id", "custom_hostname", "is_public", "invitation_hash") VALUES (${noteSettings.noteId}, '${customHostname}', ${noteSettings.isPublic}, '${noteSettings.invitationHash}')`);
  }

  /**
   * Inserts note team mock to then db
   *
   * @param noteTeam - noteTam object which contain all info about noteTeam
   */
  public async insertNoteTeam(noteTeam: {userId: number, noteId: number, role: number}): Promise<unknown> {
    return await this.orm.connection.query(`INSERT INTO public.note_teams ("user_id", "note_id", "role") VALUES (${noteTeam.userId}, ${noteTeam.noteId}, ${noteTeam.role})`);
  }

  /**
   * Inserts note relation mock to then db
   *
   * @param noteRelation object which contain all info about noteRelation
   */
  public async insertNoteRelation(noteRelation: {noteId: number, parentId: number}): Promise<unknown> {
    return await this.orm.connection.query(`INSERT INTO public.note_relations ("note_id", "parent_id") VALUES (${noteRelation.noteId}, ${noteRelation.parentId})`);
  }

  /**
   * Inserts editor tool mock to then db
   *
   * @param editorTool object which contain all info about editorTool (some info is optional)
   *
   * if no isDefault passed, then is_default would be false in database
   */
  public async insertEditorTool(editorTool: {name: string, title: string, exportName: string, source: JSON, isDefault: boolean}): Promise<unknown> {
    const isDefault = editorTool.isDefault ?? null;

    return await this.orm.connection.query(`INSERT INTO public.editor_tools ("name", "title", "export_name", "source", "is_default") VALUES ('${editorTool.name}', '${editorTool.title}', '${editorTool.exportName}', '${editorTool.exportName}', ${isDefault}')`);
  }
};
