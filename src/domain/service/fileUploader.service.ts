import type { FileData } from '@domain/entities/file.js';
import { FileTypes } from '@domain/entities/file.js';
import type { NoteInternalId } from '@domain/entities/note.js';
import type User from '@domain/entities/user.js';
import { createFileId } from '@infrastructure/utils/id';
import type FileRepository from '@repository/file.repository.js';
import type ObjectRepository from '@repository/object.repository.js';
import type NoteSettingsSharedMethods from './shared/noteSettings.js';
import { MemberRole } from '@domain/entities/team';
import { DomainError } from '@domain/entities/DomainError.js';

/**
 * File data for upload
 */
interface FileToUpload {
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
  /**
   * File type
   */
  type: FileTypes;
}

/**
 * File upload details, contains user id, who uploaded the file and note id, in case if file is a part of note
 */
interface FileUploadDetails {
  /**
   * User who uploaded the file
   */
  userId?: User['id'];

  /**
   * In case if file is a part of note, note id to identify permissions to access
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
   * Note settings shared methods
   */
  private readonly noteSettingsSharedMethods: NoteSettingsSharedMethods;

  /**
   * File uploader service constructor
   *
   * @param objectRepository - repository for objects
   * @param fileRepository - repository for files data
   * @param noteSettingsSharedMethods - note settings shared methods
   */
  constructor(objectRepository: ObjectRepository, fileRepository: FileRepository, noteSettingsSharedMethods: NoteSettingsSharedMethods) {
    this.noteSettingsSharedMethods = noteSettingsSharedMethods;
    this.objectRepository = objectRepository;
    this.fileRepository = fileRepository;
  }

  /**
   * Upload file
   *
   * @param fileData - file data to upload (e.g. buffer, name, mimetype)
   * @param details - file upload details (e.g. user id, note id)
   */
  public async uploadFile(fileData: FileToUpload, details?: FileUploadDetails): Promise<string> {
    const key = createFileId();

    let hasPermissions: boolean;

    /**
     * If file is a part of note, check if user has permissions to access file
     */
    if (details?.noteId !== undefined) {
      hasPermissions = await this.hasPermissionsToAccessFileInNote(details.noteId, MemberRole.Write, details.userId);
    } else {
      hasPermissions = true;
    }

    if (hasPermissions === false) {
      throw new DomainError('User has no permissions to access file');
    }

    const bucket = this.defineBucketByFileType(fileData.type);

    const uploaded = await this.objectRepository.insert(fileData.data, key, bucket);

    if (uploaded === null) {
      throw new DomainError('File was not uploaded');
    }

    const file = await this.fileRepository.insert({
      ...fileData,
      key,
      userId: details?.userId,
      noteId: details?.noteId,
      size: fileData.data.length,
    });

    if (file === null) {
      throw new Error('File was not uploaded');
    }

    return file.key;
  }

  /**
   * Get file data by key
   *
   * @param key - file key
   * @param userId - user id to check permissions
   */
  public async getFileDataByKey(key: string, userId?: User['id']): Promise<FileData> {
    const file = await this.fileRepository.getByKey(key);

    if (file === null) {
      throw new DomainError('File not found');
    }

    let hasPermissions: boolean;

    /**
     * If file is a part of note, check if user has permissions to access file
     */
    if (file.noteId !== undefined) {
      hasPermissions = await this.hasPermissionsToAccessFileInNote(file.noteId, MemberRole.Read, userId);
    } else {
      hasPermissions = true;
    }

    if (hasPermissions === false) {
      throw new DomainError('User has no permissions to access file');
    }

    const bucket = this.defineBucketByFileType(file.type);

    const fileData = await this.objectRepository.getByKey(file.key, bucket);

    if (fileData === null) {
      throw new DomainError('File not found');
    }

    return fileData;
  }

  /**
   * Check if user has permissions to access file in note
   *
   * @param noteId - note id where file is located
   * @param neededRole - needed role to access file
   * @param userId - user id
   */
  private async hasPermissionsToAccessFileInNote(noteId: NoteInternalId, neededRole: MemberRole, userId?: User['id']): Promise<boolean> {
    if (neededRole === MemberRole.Read) {
      /**
       * If file is public, everyone can access it
       */
      const noteSettings = await this.noteSettingsSharedMethods.getNoteSettingsByNoteId(noteId);

      if (noteSettings?.isPublic === true) {
        return true;
      }

      /**
       * If user id is not defined, user has no permissions to access file, because file is not public
       */
      if (userId === undefined) {
        return false;
      }

      /**
       * If user is a member of note, he can access file
       */
      const userRole = await this.noteSettingsSharedMethods.getUserRoleByUserIdAndNoteId(userId, noteId);

      if (userRole !== undefined) {
        return true;
      }

      return false;
    }

    /**
     * If user id is not defined, user has no permissions to access file
     */
    if (userId === undefined) {
      return false;
    }

    /**
     * If user is a member of note, check if he has needed role
     */
    const userRole = await this.noteSettingsSharedMethods.getUserRoleByUserIdAndNoteId(userId, noteId);

    if (userRole === neededRole) {
      return true;
    }

    return false;
  }

  /**
   * Define bucket name by file type
   *
   * @param fileType - file type
   */
  private defineBucketByFileType(fileType: FileTypes): string {
    switch (fileType) {
      case FileTypes.avatar:
        return 'avatars';
      case FileTypes.noteInternalFile:
        return 'noteInternalFiles';
      default:
        throw new Error('Unknown file type');
    }
  }
}
