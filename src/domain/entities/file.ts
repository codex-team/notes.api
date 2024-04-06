import type { NoteInternalId } from './note.js';
import type { Buffer } from 'buffer';
import type User from './user.js';

/**
 * File types for storing in object storage
 */
export enum FileType {
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
 * Additional data about uploaded file, ex. user id, who uploaded it
 */
export interface FileMetadata {
  /**
   * User who uploaded file
   */
  userId: User['id'];
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
export type FileLocation = TestFileLocation | NoteAttachmentFileLocation;

/**
 * File location type, wich depends on file type
 */
export interface FileLocationByType {
  [FileType.Test]: TestFileLocation,
  [FileType.NoteAttachment]: NoteAttachmentFileLocation,
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
  type: FileType;

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
  location: FileLocation;

  /**
   * File metadata
   */
  metadata: FileMetadata;
}

/**
 * File creation attributes
 */
export type FileCreationAttributes = Omit<UploadedFile, 'id' | 'createdAt'>;

/**
 * File data
 */
export type FileData = Buffer;
