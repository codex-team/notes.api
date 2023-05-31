import Note from '@domain/entities/note.js';

/**
 * Interface for the add note options.
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
   * @returns {unknown} - added note object
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
