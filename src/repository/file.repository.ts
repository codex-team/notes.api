import type UploadedFile from '@domain/entities/file.js';
import type { FileCreationAttributes } from '@domain/entities/file.js';
import type FileStorage from './storage/file.storage.js';

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
}
