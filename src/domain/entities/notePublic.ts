import type User from '@domain/entities/user.js';

/**
 * Note entity
 */
export interface NotePublic {
  /**
   * Note id
   */
  id: string;

  /**
   * Note content
   */
  content: JSON;

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
export type NoteCreationAttributes = Pick<NotePublic, 'id' | 'content' | 'creatorId'>;
