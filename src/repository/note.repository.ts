import Note from '@domain/entities/note.js';
import NoteStorage from './storage/note.storage.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class NoteRepository {
  /**
   * Note storage instance
   */
  public storage: NoteStorage;

  /**
   * Note repository constructor
   *
   * @param storage - storage for note
   */
  constructor(storage: NoteStorage) {
    this.storage = storage;
  }

  /**
   * Add note
   *
   * @param note - note to add
   */
  public addNote(note: Note): void {
    this.storage.insertNote(note);
  }
}
