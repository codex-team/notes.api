import Note from '@domain/entities/note.js';
import type NoteRepository from '@repository/note.repository.js';

/**
 * Note service
 */
export default class NoteService {
  /**
   * Note repository
   */
  public repository: NoteRepository;

  /**
   * Note service constructor
   *
   * @param repository - note repository
   */
  constructor(repository: NoteRepository) {
    this.repository = repository;
  }

  /**
   * Adds note
   *
   * @param title - note title
   * @param content - note content
   * @returns { Note } added note object
   */
  public async addNote(title: string, content: string): Promise<Note> {
    const note = new Note(title, content);

    const addedNote = await this.repository.addNote(note);

    return {
      id: addedNote.id,
      title: addedNote.title,
      content: addedNote.content,
    };
  }

  /**
   * Gets note by id
   *
   * @param id - note id
   * @returns { Promise<Note | null> } note
   */
  public async getNoteById(id: number): Promise<Note | null> {
    return await this.repository.getNoteById(id);
  }
}
