import type { DatabaseConfig } from '@infrastructure/config/index.js';
import NoteStorage from './storage/note.storage.js';
import NoteSettingsStorage from './storage/noteSettings.storage.js';
import NoteRelationshipStorage from './storage/noteRelationshp.storage.js';
import NoteRepository from './note.repository.js';
import NoteSettingsRepository from './noteSettings.repository.js';
import Orm from './storage/postgres/orm/index.js';
import UserSessionRepository from '@repository/userSession.repository.js';
import UserSessionStorage from '@repository/storage/userSession.storage.js';
import EditorToolsStorage from '@repository/storage/editorTools.storage.js';
import UserStorage from '@repository/storage/user.storage.js';
import GoogleApiTransport from '@repository/transport/google-api/index.js';
import UserRepository from '@repository/user.repository.js';
import AIRepository from './ai.repository.js';
import OpenAIApi from './transport/openai-api/index.js';
import EditorToolsRepository from '@repository/editorTools.repository.js';
import TeamRepository from '@repository/team.repository.js';
import TeamStorage from '@repository/storage/team.storage.js';
import NoteRelationshipRepository from '@repository/noteRelationship.repository.js';

/**
 * Interface for initiated repositories
 */
export interface Repositories {
  /**
   * Note repository instance
   */
  noteRepository: NoteRepository,

  /**
   * Note settings repository instance
   */
  noteSettingsRepository: NoteSettingsRepository,

  /**
   * Note relationship repository instance
   */
  noteRelationshipRepository: NoteRelationshipRepository,

  /**
   * User session repository instance
   */
  userSessionRepository: UserSessionRepository,

  /**
   * User repository instance
   */
  userRepository: UserRepository,

  /**
   * AI repository instance
   */
  aiRepository: AIRepository
  editorToolsRepository: EditorToolsRepository,

  /**
   * Team repository instance
   */
  teamRepository: TeamRepository,
}

/**
 * Initiate ORM
 *
 * @param databaseConfig - database config
 */
export async function initORM(databaseConfig: DatabaseConfig): Promise<Orm> {
  const orm = new Orm(databaseConfig);

  /**
   * Test the connection by trying to authenticate
   */
  await orm.authenticate();

  return orm;
}

/**
 * Initiate repositories
 *
 * @param orm - ORM instance
 */
export async function init(orm: Orm): Promise<Repositories> {
  /**
   * Create storage instances
   */
  const userStorage = new UserStorage(orm);
  const noteStorage = new NoteStorage(orm);
  const userSessionStorage = new UserSessionStorage(orm);
  const noteSettingsStorage = new NoteSettingsStorage(orm);
  const noteRelationshipStorage = new NoteRelationshipStorage(orm);
  const teamStorage = new TeamStorage(orm);

  /**
   * Create associations between note and note settings
   */
  noteStorage.createAssociationWithNoteSettingsModel(noteSettingsStorage.model);
  noteSettingsStorage.createAssociationWithNoteModel(noteStorage.model);

  /**
   * Create associations between note and team, user and team
   */
  teamStorage.createAssociationWithNoteModel(noteStorage.model);
  teamStorage.createAssociationWithUserModel(userStorage.model);

  /**
   * Create associations between note and relations table
   */
  noteRelationshipStorage.createAssociationWithNoteModel(noteStorage.model);

  const editorToolsStorage = new EditorToolsStorage(orm);

  /**
   * Prepare db structure
   */
  await userStorage.model.sync();
  await noteStorage.model.sync();
  await noteSettingsStorage.model.sync();
  await teamStorage.model.sync();
  await userSessionStorage.model.sync();
  await editorToolsStorage.model.sync();
  await noteRelationshipStorage.model.sync();

  /**
   * Create transport instances
   */
  const googleApiTransport = new GoogleApiTransport();
  const openaiApiTransport = new OpenAIApi();

  /**
   * Create repositories
   */
  const noteRepository = new NoteRepository(noteStorage);
  const noteSettingsRepository = new NoteSettingsRepository(noteSettingsStorage);
  const noteRelationshipRepository = new NoteRelationshipRepository(noteRelationshipStorage);
  const userSessionRepository = new UserSessionRepository(userSessionStorage);
  const userRepository = new UserRepository(userStorage, googleApiTransport);
  const aiRepository = new AIRepository(openaiApiTransport);
  const editorToolsRepository = new EditorToolsRepository(editorToolsStorage);
  const teamRepository = new TeamRepository(teamStorage);

  return {
    noteRepository,
    noteSettingsRepository,
    noteRelationshipRepository,
    userSessionRepository,
    userRepository,
    aiRepository,
    editorToolsRepository,
    teamRepository,
  };
}
