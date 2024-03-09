import type { NoteInternalId } from '@domain/entities/note';

/**
 * Which methods of Domain can be used by other domains
 * Uses to docouple domains from each other
 */

export default interface NoteServiceSharedMethods {
  /**
   * Get parent note id by note id
   *
   * @param noteId - id of the current note
   */
  getParentNoteIdByNoteId(noteId: NoteInternalId): Promise<NoteInternalId | null>;
}