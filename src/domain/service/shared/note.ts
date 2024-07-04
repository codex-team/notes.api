import type { NoteInternalId } from '@domain/entities/note.js';
import type { NotePublicId } from '@domain/entities/note.js';

/**
 * Which methods of Domain can be used by other domains
 * Uses to docouple domains from each other
 */

export default interface NoteServiceSharedMethods {
  /**
   * Get parent note id by note id
   * @param noteId - id of the current note
   */
  getParentNoteIdByNoteId(noteId: NoteInternalId): Promise<NoteInternalId | null>;

  /**
   * Get note public id by it's internal id
   * Used for making entities that use NoteInternalId public
   * @param id - internal id of the note
   */
  getNotePublicIdByInternal(noteId: NoteInternalId): Promise<NotePublicId>;
}
