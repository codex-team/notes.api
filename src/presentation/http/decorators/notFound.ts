import { StatusCodes } from 'http-status-codes';
import type { FastifyReply } from 'fastify';

/**
 * Custom method for sending 404 error
 * @example
 *
 *  if (note === null) {
 *    return reply.notFound('Note not found');
 *  }
 * @param message - custom message
 */
export default async function notFound(this: FastifyReply, message = 'Not found'): Promise<void> {
  await this
    .code(StatusCodes.NOT_FOUND)
    .type('application/json')
    .send({
      message,
    });
}
