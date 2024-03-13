import type { FileData } from '@domain/entities/file.js';
import { FileTypes } from '@domain/entities/file.js';
import type { NoteInternalId } from '@domain/entities/note.js';
import type User from '@domain/entities/user.js';
import { createFileId } from '@infrastructure/utils/id.js';
import type FileRepository from '@repository/file.repository.js';
import type ObjectRepository from '@repository/object.repository.js';
import { DomainError } from '@domain/entities/DomainError.js';
import mime from 'mime';
import { isEmpty } from '@infrastructure/utils/empty';

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
 * File upload metadata
 */
interface Metadata {
  /**
   * User id who uploaded the file
   */
  userId?: User['id'];
}

/**
 * File upload location, for now only note id, if file is a part of note
 */
interface Location {
  /**
   * Note id
   */
  noteId?: NoteInternalId;
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
   *
   * @param objectRepository - repository for objects
   * @param fileRepository - repository for files data
   */
  constructor(objectRepository: ObjectRepository, fileRepository: FileRepository) {
    this.objectRepository = objectRepository;
    this.fileRepository = fileRepository;
  }

  /**
   * Upload file
   *
   * @param type - file type
   * @param fileData - file data, including file data, name and mimetype
   * @param location - file location, for now only note id, if file is a part of note
   * @param metadata - file metadata, including user id who uploaded the file
   */
  public async uploadFile(type: FileTypes, fileData: UploadFileData, location: Location, metadata: Metadata): Promise<string> {
    const fileHash = createFileId();

    /**
     * Note id is required for note attachment
     */
    if (type === FileTypes.noteAttachment && isEmpty(location.noteId)) {
      throw new DomainError('Note id is required for note attachment');
    }

    /**
     * Extension can be null if file mime type is unknown or not supported
     */
    const fileExtension = mime.getExtension(fileData.mimetype);

    if (fileExtension === null) {
      throw new DomainError('Unknown file extension');
    }

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
      userId: metadata?.userId,
      noteId: location?.noteId,
      size: fileData.data.length,
    });

    if (file === null) {
      throw new DomainError('File was not uploaded');
    }

    return file.key;
  }

  /**
   * Get file data by key
   *
   * @param objectKey - unique file key in object storage
   */
  public async getFileDataByKey(objectKey: string): Promise<FileData> {
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
   * Get note id by file key, if file is a part of note
   *
   * @param objectKey - unique file key in object storage
   */
  public async getNoteIdByFileKey(objectKey: string): Promise<NoteInternalId | null> {
    return this.fileRepository.getNoteIdByFileKey(objectKey);
  }

  /**
   * Define bucket name by file type
   *
   * @param fileType - file type
   */
  private defineBucketByFileType(fileType: FileTypes): string {
    switch (fileType) {
      case FileTypes.test:
        return 'test';
      case FileTypes.noteAttachment:
        return 'note-attachment';
      default:
        throw new DomainError('Unknown file type');
    }
  }
}
