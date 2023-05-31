import NoteEntity from '@domain/entities/note.entity.js';

/**
 * Interface for the add note query.
 */
interface AddNoteQuery {
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
   * @param query - add note query
   * @returns {unknown} - added note object
   */
  public static addNote(query: unknown): unknown {
    /**
     * TODO: Validate query
     */
    const { title, content } = query as AddNoteQuery;

    const note = new NoteEntity(title, content);

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
