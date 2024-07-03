import type { FileData, NoteAttachmentFileLocation, FileLocationByType, FileLocation, FileMetadata } from '@domain/entities/file.js';
import type UploadedFile from '@domain/entities/file.js';
import { FileType } from '@domain/entities/file.js';
import { createFileId } from '@infrastructure/utils/id.js';
import type FileRepository from '@repository/file.repository.js';
import type ObjectRepository from '@repository/object.repository.js';
import { DomainError } from '@domain/entities/DomainError.js';
import mime from 'mime';
import { isEmpty } from '@infrastructure/utils/empty.js';

/**
 * File data for upload
 */
interface UploadFileData {
  /**
   * File data
   */
  data: FileData;
  /**
   * File name
   */
  name: string;
  /**
   * Mimetype of the file
   */
  mimetype: string;
}

/**
 * File uploader service
 */
export default class FileUploaderService {
  /**
   * Repository for objects
   */
  private readonly objectRepository: ObjectRepository;

  /**
   * Repository for files data
   */
  private readonly fileRepository: FileRepository;

  /**
   * File uploader service constructor
   * @param objectRepository - repository for objects
   * @param fileRepository - repository for files data
   */
  constructor(objectRepository: ObjectRepository, fileRepository: FileRepository) {
    this.objectRepository = objectRepository;
    this.fileRepository = fileRepository;
  }

  /**
   * Upload file
   * @param fileData - file data, including file data, name and mimetype
   * @param location - file location depending on type
   * @param metadata - file metadata, including user id who uploaded the file
   */
  public async uploadFile(fileData: UploadFileData, location: FileLocation, metadata: FileMetadata): Promise<string> {
    const type = this.defineFileType(location);

    const fileHash = createFileId();

    /**
     * Extension can be null if file mime type is unknown or not supported
     */
    const fileExtension = mime.getExtension(fileData.mimetype);

    if (fileExtension === null) {
      throw new DomainError('Unknown file extension');
    }

    /**
     * Key is a combination of file hash and file extension, separated by dot, e.g. `HgduSDGmsdrs.png`
     */
    const key = `${fileHash}.${fileExtension}`;

    const bucket = this.defineBucketByFileType(type);

    const uploaded = await this.objectRepository.insert(fileData.data, key, bucket);

    if (uploaded === null) {
      throw new DomainError('File was not uploaded');
    }

    const file = await this.fileRepository.insert({
      ...fileData,
      type,
      key,
      metadata,
      location: location,
      size: fileData.data.length,
    });

    if (file === null) {
      throw new DomainError('File was not uploaded');
    }

    return file.key;
  }

  /**
   * Get file location by key and type
   * Returns null if where is no such file
   * @param type - file type
   * @param key - file unique key
   */
  public async getFileLocationByKey<T extends FileType>(type: T, key: UploadedFile['key']): Promise<FileLocationByType[T] | null> {
    return await this.fileRepository.getFileLocationByKey(type, key);
  }

  /**
   * Get file data by key
   * @param objectKey - unique file key in object storage
   * @param location - file location
   */
  public async getFileData(objectKey: string, location: FileLocation): Promise<FileData> {
    /**
     * If type of requested file is note attchement, we need to check if saved file location is the same of requested
     */
    if (this.isNoteAttachemntFileLocation(location)) {
      const fileType = FileType.NoteAttachment;
      const fileLocationFromStorage = await this.fileRepository.getFileLocationByKey(fileType, objectKey);

      if (fileLocationFromStorage === null || location.noteId !== fileLocationFromStorage.noteId) {
        throw new DomainError('File not found');
      }
    }

    const file = await this.fileRepository.getByKey(objectKey);

    if (file === null) {
      throw new DomainError('File not found');
    }

    const bucket = this.defineBucketByFileType(file.type);

    const fileData = await this.objectRepository.getByKey(file.key, bucket);

    if (fileData === null) {
      throw new DomainError('File not found');
    }

    return fileData;
  }

  /**
   * Delete file
   * @param key - file key
   */
  public async deleteFile(key: UploadedFile['key']): Promise<void> {
    const fileData = await this.fileRepository.getByKey(key);

    if (isEmpty(fileData)) {
      throw new DomainError('File not found');
    }

    /**
     * Define file type and bucket
     */
    const fileType = this.defineFileType(fileData.location);
    const bucket = this.defineBucketByFileType(fileType);

    /**
     * Delete file from object storage and database
     */
    const isRemovedFromObjectStorage = await this.objectRepository.delete(key, bucket);
    const isRemovedFromDatabase = await this.fileRepository.deleteByKey(key);

    if (isRemovedFromObjectStorage === false || isRemovedFromDatabase === false) {
      throw new DomainError('Cannot delete file');
    }
  }

  /**
   * Define file type by location
   * @param location - file location
   */
  private defineFileType(location: FileLocation): FileType {
    if (this.isNoteAttachemntFileLocation(location)) {
      return FileType.NoteAttachment;
    }

    return FileType.Test;
  }

  /**
   * Check if file location is note attachemnt
   * @param location - to check
   */
  private isNoteAttachemntFileLocation(location: FileLocation): location is NoteAttachmentFileLocation {
    return 'noteId' in location;
  }

  /**
   * Define bucket name by file type
   * @param fileType - file type
   */
  private defineBucketByFileType(fileType: FileType): string {
    switch (fileType) {
      case FileType.Test:
        return 'test';
      case FileType.NoteAttachment:
        return 'note-attachment';
      default:
        throw new DomainError('Unknown file type');
    }
  }
}
