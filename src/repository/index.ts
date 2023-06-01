import { DatabaseConfig } from '@infrastructure/config/index.js';
import Database from '@repository/postgres/database.js';
import NoteStorage from '@repository/postgres/orm/note.js';
import NoteRepository from '@repository/note.js';

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
export async function initRepositories(databaseConfig: DatabaseConfig): Promise<Repositories> {
  const database = new Database(databaseConfig);

  const conn = await database.connect();

  /**
   * Create storage instances
   */
  const noteStorage = new NoteStorage(conn);

  /**
   * Create repositories
   */
  const noteRepository = new NoteRepository(noteStorage);

  return {
    noteRepository,
  };
}
