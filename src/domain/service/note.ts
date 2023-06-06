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
 * Interface for the added note object.
 */
interface AddedNoteObject {
  /**
   * Note id
   */
  id: number;

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
   * @returns { AddedNoteObject } added note object
   */
  public async addNote({ title, content }: AddNoteOptions): Promise<AddedNoteObject> {
    const note = new Note(title, content);

    const addedNote = await this.repository.addNote(note);

    return {
      id: addedNote.id,
      title: addedNote.title,
      content: addedNote.content,
    };
  }
}
