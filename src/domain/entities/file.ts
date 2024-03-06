import type { Note } from './note.js';
import type User from './user.js';

/**
 * File types for storing in object storage
 */
export enum FileTypes {
  /**
   * @todo define types
   */
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
  userId: User['id'];

  /**
   * File uploaded at
   */
  uploadedAt: Date;

  /**
   * File name (e.g. `image.png`)
   */
  name: string;

  /**
   * File extension (e.g. `png`)
   */
  extension: string;

  /**
   * File type, using to store in object storage
   */
  type: FileTypes;

  /**
   * File size in bytes
   */
  size: number;

  /**
   * In case if file is a part of note, note id to indetify permissions to access
   */
  noteId?: Note['id'];
}

/**
 * File creation attributes
 */
export type FileCreationAttributes = Omit<UploadedFile, 'id'>;
