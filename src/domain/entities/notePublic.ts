import type User from '@domain/entities/user.js';


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

