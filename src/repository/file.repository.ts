import type UploadedFile from '@domain/entities/file.js';
import type { FileCreationAttributes, FileTypes } from '@domain/entities/file.js';
import type FileStorage from './storage/file.storage.js';
import type { NoteInternalId } from '@domain/entities/note.js';

/**
 * File repository
 */
export default class FileRepository {
  private readonly storage: FileStorage;

  /**
   * File repository constructor
   *
   * @param storage - file storage with methods to access file data
   */
  constructor(storage: FileStorage) {
    this.storage = storage;
  }

  /**
   * Get file data by key
   *
   * @param objectKey - unique file key in storage
   */
  public async getByKey(objectKey: string): Promise<UploadedFile | null> {
    return this.storage.getFileDataByKey(objectKey);
  }

  /**
   * Inserts file data
   *
   * @param fileData - file data
   */
  public async insert(fileData: FileCreationAttributes): Promise<UploadedFile> {
    return await this.storage.insertFile(fileData);
  }

  /**
   * Get note id by file key
   *
   * @param objectKey - unique file key in storage
   * @param type - file type
   */
  public async getNoteIdByFileKeyAndType(objectKey: string, type: FileTypes): Promise<NoteInternalId | null> {
    return await this.storage.getNoteIdByFileKey(objectKey, type);
  }
}
