import type { NoteContent, NotePublicId } from './note.js';

export interface NoteTree {

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
  childNotes: NoteTree[] | null;

}
