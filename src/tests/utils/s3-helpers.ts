import type { S3Storage } from '@repository/storage/s3/index.js';

/**
 * Bucket are needed to to be created
 */
const Buckets = [
  'test',
  'note-attachment',
];

/**
 * Class with methods to create buckets in storage or creating mock data in it
 */
export default class S3Helpers {
  private s3: S3Storage;

  /**
   * Constructor for s3 helpers
   *
   * @param s3 - s3 client instance
   */
  constructor(s3: S3Storage) {
    this.s3 = s3;
  }
  /**
   * Create buckets in s3 storage for testing
   */
  public async createBuckets(): Promise<void> {
    for (const bucket of Buckets) {
      await this.s3.createBucket(bucket);
    }
  }
}
