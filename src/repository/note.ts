import Note from '@domain/entities/note.js';

/**
 * Note repository
 */
export default class NoteRepository {
  /**
   * TODO - use existing storage
   */
  public storage: unknown;

  /**
   * Note repository constructor
   *
   * @param storage - storage for note
   */
  constructor(storage: unknown) {
    this.storage = storage;
  }

  /**
   * Add note
   *
   * @param note - note to add
   */
  public addNote(note: Note): Note {
    /**
     * TODO - add saving to storage
     */
    return note;
  }
}
