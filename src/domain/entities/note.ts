/**
 * Note internal id. Used to query Note by internal API
 */
export type NoteInternalId = number;

/**
 * Id visible for users. Used to query Note by public API
 */
export type NotePublicId = string;

/**
 * Id from DataBase. Used to query Note by User (creator) id
 */
export type NoteCreatorId = number;

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
  content: JSON;

  /**
   * Note creator id
   */
  creatorId: NoteCreatorId;

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
