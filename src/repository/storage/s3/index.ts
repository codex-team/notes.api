import { getLogger } from '@infrastructure/logging/index.js';
import { S3Client, GetObjectCommand, PutObjectCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';
import { Readable } from 'stream';
import { streamToBuffer } from '@infrastructure/utils/streamToBuffer.js';
import { isEmpty } from '@infrastructure/utils/empty.js';

const s3StorageLogger = getLogger('s3Storage');

/**
 * Class to handle S3 bucket operations
 */
export class S3Storage {
  /**
   * S3 instance
   */
  private readonly s3: S3Client;

  /**
   * Constructor for S3Bucket
   * @param accessKeyId - AWS access key
   * @param secretAccessKey - AWS secret access key
   * @param region - AWS region
   * @param endpoint - AWS endpoint (in case of localstack or other S3 compatible services)
   */
  constructor(accessKeyId: string, secretAccessKey: string, region?: string, endpoint?: string) {
    this.s3 = new S3Client({
      endpoint,
      region,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Method to upload a file to S3
   * @param bucket - S3 bucket name
   * @param key - Key to store the file in S3
   * @param file - file data to upload
   */
  public async uploadFile(bucket: string, key: string, file: Buffer): Promise<string | null> {
    try {
      /**
       * Try to upload file data to s3
       */
      await this.s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
      }))
    } catch (error) {
      s3StorageLogger.error(error);

      return null;
    }

    return key;
  }

  /**
   * Method to get a file from S3
   * @param bucket - S3 bucket name
   * @param key - Key of the file in S3
   */
  public async getFile(bucket: string, key: string): Promise<Buffer | null> {
    try {
      const { Body } = await this.s3.send(new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }));

      /**
       * Body must be readable to parse stream
       */
      if (!(Body instanceof Readable)) {
        throw new Error("Expected Body to be a Readable stream");
      }
      const fileContent = await streamToBuffer(Body);
      return fileContent;
    } catch (err) {
      s3StorageLogger.error(err);
      return null;
    }
  }

  /**
   * Method to create bucket in object storage, return its location
   * @param name - bucket name
   */
  public async createBucket(name: string): Promise<string | null> {
    try {
      const { Location } = await this.s3.send(new CreateBucketCommand({
        Bucket: name,
      }));

      if (isEmpty(Location)) {
        return null;
      }

      return Location;
    } catch (err) {
        s3StorageLogger.error(err);

        return null;
    }
  }
}
