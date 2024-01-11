import { StatusCodes } from 'http-status-codes';
import type { FastifyReply } from 'fastify';

/**
 * Custom method for sending 500 error
 *
 * Send this error when a domain-level error is thrown
 *
 * @example
 *
 *  if (note.creatorId !== userId) {
 *    return reply.domainError('Note with id ${id} was not updated');
 *  }
 *
 * @param message - custom message
 */
export default async function domainError(this: FastifyReply, message = 'Domain level error'): Promise<void> {
  await this
    .code(StatusCodes.INTERNAL_SERVER_ERROR)
    .type('application/json')
    .send({
      message,
    });
}