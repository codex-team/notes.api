import type { NotePublicId } from './note.js';
import type { SidebarPosition } from './noteSettings.js';

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
   * Position of the root note in the sidebar
   */
  sidebarPosition?: SidebarPosition;

  /**
   * child notes
   */
  childNotes: NoteHierarchy[] | null;
}
