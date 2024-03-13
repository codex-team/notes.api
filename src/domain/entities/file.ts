import type { NoteInternalId } from './note.js';
import type User from './user.js';
import type { Buffer } from 'buffer';

/**
 * File types for storing in object storage
 */
export enum FileTypes {
  /**
   * @todo define real types
   */
  test = 'test',

  /**
   * File is a part of note
   */
  noteAttachment = 'noteAttachment',
}

/**
 * Interface representing a file entity
 */
export default interface UploadedFile {
  /**
   * File identifier
   */
  id: number;

  /**
   * File unique hash which stores in some object storage
   */
  key: string;

  /**
   * User who uploaded the file
   */
  userId?: User['id'];

  /**
   * File name
   */
  name: string;

  /**
   * File mimetype (e.g. `image/png`)
   */
  mimetype: string;

  /**
   * File type, using to store in object storage
   */
  type: FileTypes;

  /**
   * File size in bytes
   */
  size: number;

  /**
   * File creation date
   */
  createdAt: Date;

  /**
   * In case if file is a part of note, note id to identify permissions to access
   */
  noteId?: NoteInternalId;
}

/**
 * File creation attributes
 */
export type FileCreationAttributes = Omit<UploadedFile, 'id' | 'createdAt'>;

/**
 * File data
 */
export type FileData = Buffer;
