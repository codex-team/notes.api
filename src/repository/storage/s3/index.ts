import { getLogger } from '@infrastructure/logging/index.js';
import S3 from 'aws-sdk/clients/s3.js';
import type { Buffer } from 'buffer';

const s3StorageLogger = getLogger('s3Storage');

/**
 * Class to handle S3 bucket operations
 */
export class S3Storage {
  /**
   * S3 instance
   */
  private readonly s3: S3;

  /**
   * Constructor for S3Bucket
   *
   * @param accessKeyId - AWS access key
   * @param secretAccessKey - AWS secret access key
   * @param region - AWS region
   * @param endpoint - AWS endpoint (in case of localstack or other S3 compatible services)
   */
  constructor(accessKeyId: string, secretAccessKey: string, region?: string, endpoint?: string) {
    this.s3 = new S3({
      endpoint,
      region,
      s3ForcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Method to upload a file to S3
   *
   * @param bucket - S3 bucket name
   * @param key - Key to store the file in S3
   * @param file - file data to upload
   */
  public async uploadFile(bucket: string, key: string, file: Buffer): Promise<string | null> {
    /**
     * Create an upload manager to upload the file to S3
     */
    const uploadManager = this.s3.upload({
      Bucket: bucket,
      Key: key,
      Body: file,
    });

    /**
     * Wait for the upload to complete and return the URL of the uploaded file
     */
    try {
      const response = await uploadManager.promise();

      return response.Location;
    } catch (error) {
      s3StorageLogger.error(error);

      return null;
    }
  }

  /**
   * Method to get a file from S3
   *
   * @param bucket - S3 bucket name
   * @param key - Key of the file in S3
   */
  public async getFile(bucket: string, key: string): Promise<Buffer | null> {
    const getObjectManager = this.s3.getObject({
      Bucket: bucket,
      Key: key,
    });

    try {
      const response = await getObjectManager.promise();

      return response.Body as Buffer;
    } catch (error) {
      s3StorageLogger.error(error);

      return null;
    }
  }

  /**
   * Method to create bucket in object storage, return its location
   *
   * @param name - bucket name
   */
  public async createBucket(name: string): Promise<string | null> {
    const createBucketManager = this.s3.createBucket({
      Bucket: name,
    });

    try {
      const response = await createBucketManager.promise();

      return response.Location as string;
    } catch (error) {
      s3StorageLogger.error(error);

      return null;
    }
  }
}
