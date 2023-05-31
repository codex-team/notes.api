import Note from '@domain/entities/note.js';
import NoteRepository from '@repository/note.js';

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
  id: string;

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
  public addNote({ title, content }: AddNoteOptions): AddedNoteObject {
    const note = new Note(title, content);

    const addedNote = this.repository.addNote(note);

    return {
      id: addedNote.id,
      title: addedNote.title,
      content: addedNote.content,
    };
  }
}
