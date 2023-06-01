import { Sequelize } from 'sequelize';
import Note from '@domain/entities/note.js';

/**
 * Class for note storage
 */
export default class NoteStorage {
  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Constructor for note storage
   *
   * @param database - database instance
   */
  constructor(database: Sequelize) {
    this.database = database;
  }

  /**
   * Insert note to database
   *
   * @param note - note to insert
   * @returns { Note } - inserted note
   */
  public insertNote(note: Note): Note {
    /**
     * TODO - add note to database
     */
    note.id = '42';

    return note;
  }
}
