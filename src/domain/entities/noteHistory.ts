import type { NoteInternalId, Note, NotePublicId } from './note.js';
import type User from './user.js';

export interface NoteHistoryRecord {
  /**
   * Unique identified of note history record
   */
  id: number;

  /**
   * Id of the note whose content history is stored
   */
  noteId: NoteInternalId;

  /**
   * User that updated note content
   */
  userId: User['id'];

  /**
   * Timestamp of note update
   */
  createdAt: string;

  /**
   * Version of note content
   */
  content: Note['content'];

  /**
   * Note tools of current version of note content
   */
  tools: Note['tools'];
}

/**
 * Part of note entity used to create new note
 */
export type NoteHistoryCreationAttributes = Omit<NoteHistoryRecord, 'id' | 'createdAt'>;

/**
 * Meta data of the note history record
 * Used for presentation of the note history record in web
 */
export type NoteHistoryMeta = Omit<NoteHistoryRecord, 'content' | 'noteId' | 'tools'>;

/**
 * Public note history record with note public id instead of note internal id
 */
export type NoteHistoryPublic = Omit<NoteHistoryRecord, 'noteId'> & { noteId: NotePublicId };
