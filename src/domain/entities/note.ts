import type User from '@domain/entities/user.js';

/**
 * Note internal id. Used to query Note by internal API
 */
export type NoteInternalId = number;

/**
 * Id visible for users. Used to query Note by public API
 */
export type NotePublicId = string;

/**
 * Note entity
 */
export interface Note {
  /**
   * Note id
   */
  id: NoteInternalId;

  /**
   * Note public id
   */
  publicId: NotePublicId;

  /**
   * Note content
   */
  content: {
    blocks: Array<{
      id: string;
      type: string;
      data: unknown;
      tunes?: {[name: string]: unknown}
    }>
  };

  /**
   * Note creator id
   */
  creatorId: User['id'];

  /**
   * When note was created
   */
  createdAt: string;

  /**
   * Last time note was updated
   */
  updatedAt: string;
}


/**
 * Part of note entity used to create new note
 */
export type NoteCreationAttributes = Pick<Note, 'publicId' | 'content' | 'creatorId'>;
