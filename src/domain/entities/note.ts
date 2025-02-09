import type User from '@domain/entities/user.js';
import type EditorTool from './editorTools.js';

/**
 * Note internal id. Used to query Note by internal API
 */
export type NoteInternalId = number;

/**
 * Id visible for users. Used to query Note by public API
 */
export type NotePublicId = string;

/**
 * Reference to a particular tools that were used for note creation
 */
export type ToolUsedInNoteContent = {
  /**
   * Name of certain editor tool
   */
  name: EditorTool['name'];

  /**
   * Id of certain editor tool (nanoid)
   */
  id: EditorTool['id'];
};

/**
 * NoteContent
 */
export type NoteContent = {
  blocks: Array<{
    id: string;
    type: string;
    data: unknown;
    tunes?: { [name: string]: unknown };
  }>;
};

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
  content: NoteContent;

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

  /**
   * Note image id
   */
  cover?: string | null;

  /**
   * All tools used in certain note
   */
  tools: ToolUsedInNoteContent[];
}

/**
 * Part of note entity used to create new note
 */
export type NoteCreationAttributes = Pick<Note, 'publicId' | 'content' | 'creatorId' | 'tools'>;
