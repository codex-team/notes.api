import { StatusCodes } from 'http-status-codes';
import type { FastifyReply } from 'fastify';

/**
 * Custom method for sending 403 error
 *
 * Send this error when USER IS AUTHENTICATED, but he doesn't have access to the resource
 *
 * @example
 *
 *  if (note.creatorId !== userId) {
 *    return reply.forbidden('You don\'t have access to this note');
 *  }
 *
 * @param message - custom message
 */
export default async function forbidden(this: FastifyReply, message = 'Permission denied'): Promise<void> {
  await this
    .code(StatusCodes.FORBIDDEN)
    .type('application/json')
    .send({
      message,
    });
}
