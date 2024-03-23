import type { NoteInternalId } from '@domain/entities/note.ts';
import type User from '@domain/entities/user.ts';

/**
 * NoteView is used to store data about the last interaction between the user and the note
 */
export default interface NoteVisit {
  /**
   * Unique property identifier
   */
  id: number,

  /**
   * NoteInternalId
   */
  noteId: NoteInternalId,

  /**
   * Id of the user
   */
  userId: User['id'],

  /**
   * Time when note was visited for the last time (timestamp with timezone)
   */
  visitedAt: string,
}