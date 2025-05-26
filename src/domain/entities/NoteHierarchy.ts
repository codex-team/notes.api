import type { NotePublicId } from './note.js';

/**
 * Note Tree entity
 */
export interface NoteHierarchy {

  /**
   * public note id
   */
  noteId: NotePublicId;

  /**
   * note title
   */
  noteTitle: string;

  /**
   * child notes
   */
  childNotes: NoteHierarchy[] | null;

}
