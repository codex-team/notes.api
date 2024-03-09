import type { S3Storage } from './storage/s3/index.js';
import type { Buffer } from 'buffer';

/**
 * Repository for object storage
 */
export default class ObjectStorageRepository {
  /**
   * s3 storage
   */
  private readonly storage: S3Storage;

  /**
   * Object repository constructor
   *
   * @param storage - s3 storage
   */
  constructor(storage: S3Storage) {
    this.storage = storage;
  }

  /**
   * Get object data by key
   *
   * @param key - object key
   * @param bucket - bucket name
   */
  public async getByKey(key: string, bucket: string): Promise<Buffer | null> {
    return this.storage.getFile(bucket, key);
  }

  /**
   * Inserts object data
   *
   * @param objectData - object data
   * @param key - object key
   * @param bucket - bucket name
   */
  public async insert(objectData: Buffer, key: string, bucket: string): Promise<string | null> {
    return await this.storage.uploadFile(bucket, key, objectData);
  }
}
