import type UploadedFile from '@domain/entities/file.js';
import type { FileCreationAttributes, FileLocationByType, FileType } from '@domain/entities/file.js';
import type FileStorage from './storage/file.storage.js';

/**
 * File repository
 */
export default class FileRepository {
  private readonly storage: FileStorage;

  /**
   * File repository constructor
   * @param storage - file storage with methods to access file data
   */
  constructor(storage: FileStorage) {
    this.storage = storage;
  }

  /**
   * Get file data by key
   * @param objectKey - unique file key in storage
   */
  public async getByKey(objectKey: string): Promise<UploadedFile | null> {
    return this.storage.getFileDataByKey(objectKey);
  }

  /**
   * Inserts file data
   * @param fileData - file data
   */
  public async insert(fileData: FileCreationAttributes): Promise<UploadedFile> {
    return await this.storage.insertFile(fileData);
  }

  /**
   * Get file location by key and type, files with different types have different locations
   * @param type - file type
   * @param key - file unique key
   */
  public async getFileLocationByKey<T extends FileType>(type: T, key: UploadedFile['key']): Promise<FileLocationByType[T] | null> {
    return await this.storage.getFileLocationByKey(type, key);
  };
}
