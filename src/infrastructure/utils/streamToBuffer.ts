import type { Readable } from 'stream';
import { Buffer } from 'buffer';

/**
 * Convert stream to buffer
 * @param stream - stream object
 * @returns buffer data made from stream
 */
export const streamToBuffer = (stream: Readable): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
