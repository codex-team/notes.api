import { DatabaseConfig } from '@infrastructure/config/index.js';
import NoteStorage from './storage/note.storage.js';
import NoteRepository from './note.repository.js';
import Orm from './storage/postgres/orm/index.js';

/**
 * Interface for initiated repositories
 */
export interface Repositories {
  /**
   * Note repository instance
   */
  noteRepository: NoteRepository,
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

  /**
   * Create repositories
   */
  const noteRepository = new NoteRepository(noteStorage);

  return {
    noteRepository,
  };
}
