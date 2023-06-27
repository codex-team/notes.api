import { DatabaseConfig } from '@infrastructure/config/index.js';
import NoteStorage from './storage/note.storage.js';
import NoteRepository from './note.repository.js';
import Orm from './storage/postgres/orm/index.js';
import UserRepository from '@repository/user.repository.js';
import UserStorage from '@repository/storage/user.storage.js';
import GoogleApi from '@repository/api/google.api.js';
import OauthRepository from '@repository/oauth.repository.js';

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
 * @param googleApiUrl - google api url
 * @returns { Promise<Repositories> } initiated repositories
 */
export async function init(databaseConfig: DatabaseConfig, googleApiUrl: string): Promise<Repositories> {
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
  const googleApi = new GoogleApi(googleApiUrl);

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
