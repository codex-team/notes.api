import type { NoteContent, NotePublicId } from './note.js';

/**
 * Note Tree entity
 */
export interface NoteHierarchy {

  /**
   * public note id
   */
  id: NotePublicId;

  /**
   * note content
   */
  content: NoteContent;

  /**
   * child notes
   */
  childNotes: NoteHierarchy[] | null;

}
