import Note from '@domain/entities/note.js';
import type NoteStorage from './storage/note.storage.js';

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
   * @returns { Promise<Note> } added note
   */
  public async addNote({ title, content }: Note): Promise<Note> {
    const insertedNote = await this.storage.insertNote(title, content);

    return new Note(insertedNote.title, insertedNote.content, insertedNote.id);
  }

  /**
   * Gets note by id
   *
   * @param id - note id
   * @returns { Promise<Note | null> } found note
   */
  public async getNoteById(id: number): Promise<Note | null> {
    const noteData = await this.storage.getNoteById(id);

    if (!noteData) {
      return null;
    }

    return new Note(
      noteData.title,
      noteData.content,
      noteData.id
    );
  }
}
