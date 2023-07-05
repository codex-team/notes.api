import Note from '@domain/entities/note.js';
import NoteRepository from '@repository/note.repository.js';

/**
 * Interface for the adding note options.
 */
export interface AddNoteOptions {
  /**
   * Note title
   */
  title: string;

  /**
   * Note content
   */
  content: string;
}

/**
 * Interface for the getting note by id options.
 */
export interface GetNoteByIdOptions {
  /**
   * Note id
   */
  id: number;
}

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
   * @param options - add note options
   * @returns { Note } added note object
   */
  public async addNote({ title, content }: AddNoteOptions): Promise<Note> {
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
   * @param options - get note by id options
   * @returns { Promise<Note | null> } note
   */
  public async getNoteById({ id }: GetNoteByIdOptions): Promise<Note | null> {
    return await this.repository.getNoteById(id);
  }
}
