import Note from '@domain/entities/note.js';

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
   * Adds note
   *
   * @param options - add note options
   * @returns { AddedNoteObject } added note object
   */
  public static addNote({ title, content }: AddNoteOptions): AddedNoteObject {
    const note = new Note(title, content);

    /**
     * TODO: Add note to database
     */

    return {
      id: note.id,
      title: note.title,
      content: note.content,
    };
  }
}
