import type { NoteInternalId, Note } from './note.js';
import type User from './user.js';

export interface NoteHistoryRecord {
  /**
   * Unique identified of note history record
   */
  id: number;

  /**
   * Id of the note those content history is stored
   */
  noteId: NoteInternalId;

  /**
   * User that updated note content
   */
  userId: User['id'];

  /**
   * Timestamp of note update
   */
  updatedAt: string;

  /**
   * Version of note content
   */
  content: Note['content'];
}

/**
 * Part of note entity used to create new note
 */
export type NoteHistoryCreationAttributes = Omit<NoteHistoryRecord, 'id' | 'updatedAt'>;

export type NoteHistoryMeta = Omit<NoteHistoryRecord, 'content'>;
