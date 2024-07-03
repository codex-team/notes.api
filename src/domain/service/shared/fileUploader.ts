import type UploadedFile from '@domain/entities/file.js';

/**
 * Which methods of Domain can be used by other domains
 * Uses to decouple domains from each other
 */
export default interface FileUploaderServiceSharedMethods {
  /**
   * Delete file
   * @param key - file key
   */
  deleteFile: (key: UploadedFile['key']) => Promise<void>;
}
