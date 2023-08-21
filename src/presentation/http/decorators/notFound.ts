import { StatusCodes } from 'http-status-codes';
import type { FastifyReply } from 'fastify';

/**
 * Custom method for sending 404 error
 *
 * @example
 *
 *  if (note === null) {
 *    return fastify.notFound(reply, 'Note not found');
 *  }
 *
 * @param reply - fastify reply instance
 * @param message - custom message
 */
export default async function notFound(reply: FastifyReply, message = 'Not found'): Promise<void> {
  await reply
    .code(StatusCodes.NOT_FOUND)
    .type('application/json')
    .send({
      message,
    });
}
