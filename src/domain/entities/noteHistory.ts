import type { NoteInternalId, Note, NotePublicId } from './note.js';
import type User from './user.js';

interface UserMeta {
  /**
   * Name of the user
   */
  name: User['name'];

  /**
   * Photo of the user
   */
  photo: User['photo'];
};

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
export type NoteHistoryMeta = Omit<NoteHistoryRecord, 'content' | 'noteId' | 'tools'> & {
  /**
   * Meta data of the user who did changes
   * Used for note history metadata presentation
   */
  user: UserMeta;
};

/**
 * Entity that represents NoteHistoryRecord with user info
 */
export type NoteHistoryView = NoteHistoryRecord & { user: UserMeta };

/**
 * Public note history record with note public id instead of note internal id
 */
export type NoteHistoryPublic = Omit<NoteHistoryView, 'noteId'> & { noteId: NotePublicId };
