import { DatabaseConfig } from '@infrastructure/config/index.js';
import NoteStorage from './storage/note.storage.js';
import NoteRepository from './note.repository.js';
import Orm from './storage/postgres/orm/index.js';
import UserRepository from '@repository/user.repository.js';
import UserStorage from '@repository/storage/user.storage.js';
import GoogleApi from '@repository/api/google.api.js';
import OauthRepository from '@repository/oauth.repository';

/**
 * Interface for initiated repositories
 */
export interface Repositories {
  /**
   * Note repository instance
   */
  noteRepository: NoteRepository,

  /**
   * User repository instance
   */
  userRepository: UserRepository,

  /**
   * Google repository instance
   */
  oauthRepository: OauthRepository,
}

/**
 * Initiate repositories
 *
 * @param databaseConfig - database config
 */
export async function init(databaseConfig: DatabaseConfig): Promise<Repositories> {
  const orm = new Orm(databaseConfig);

  /**
   * Test the connection by trying to authenticate
   */
  await orm.authenticate();

  /**
   * Create storage instances
   */
  const noteStorage = new NoteStorage(orm);
  const userStorage = new UserStorage(orm);

  /**
   * Create api instances
   */
  const googleApi = new GoogleApi('https://www.googleapis.com/oauth2/v2');

  /**
   * Create repositories
   */
  const noteRepository = new NoteRepository(noteStorage);
  const userRepository = new UserRepository(userStorage);
  const oauthRepository = new OauthRepository(googleApi);

  return {
    noteRepository,
    userRepository,
    oauthRepository,
  };
}
