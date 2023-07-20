import { DatabaseConfig } from '@infrastructure/config/index.js';
import NoteStorage from './storage/note.storage.js';
import NoteRepository from './note.repository.js';
import Orm from './storage/postgres/orm/index.js';
import UserStorage from '@repository/storage/user.storage.js';
import GoogleApiTransport from '@repository/transport/google-api/index.js';
import UserRepository from '@repository/user.repository.js';

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

  await userStorage.model.sync();

  /**
   * Create transport instances
   */
  const googleApiTransport = new GoogleApiTransport();

  /**
   * Create repositories
   */
  const noteRepository = new NoteRepository(noteStorage);
  const userRepository = new UserRepository(userStorage, googleApiTransport);

  return {
    noteRepository,
    userRepository,
  };
}
