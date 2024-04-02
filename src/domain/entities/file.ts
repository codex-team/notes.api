import type { NoteInternalId } from './note.js';
import type User from './user.js';
import type { Buffer } from 'buffer';

/**
 * File types for storing in object storage
 */
export enum FileTypes {
  /**
   * Type for testing uploads
   */
  Test = 0,

  /**
   * File is a part of note
   */
  NoteAttachment = 1,
}

/**
 * File location for testing uploads, there is no defined location
 */
export type TestFileLocation = Record<never, never>;

/**
 * File location, when it is a part of note
 */
export type NoteAttachmentFileLocation = {
  noteId: NoteInternalId,
};

/**
 * Possible file location
 */
export type Location = TestFileLocation | NoteAttachmentFileLocation;

/**
 * File location type, wich depends on file type
 */
export type ComputedLocation<Type extends FileTypes> = Type extends FileTypes.NoteAttachment ? NoteAttachmentFileLocation : TestFileLocation;

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
   * Object, which stores information about file location
   */
  location: Location;
}

/**
 * File creation attributes
 */
export type FileCreationAttributes = Omit<UploadedFile, 'id' | 'createdAt'>;

/**
 * File data
 */
export type FileData = Buffer;
