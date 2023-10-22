import { StatusCodes } from 'http-status-codes';
import type { FastifyReply } from 'fastify';

/**
 * Custom method for sending 401 error
 *
 * Send this error when USER IS NOT AUTHENTICATED and he doesn't have access to the resource because of that
 *
 * @example
 *
 *  if (userId === null) {
 *    return reply.unauthorized('You must be authenticated to access this resource');
 *  }
 *
 * @param message - custom message
 */
export default async function unauthorized(this: FastifyReply, message = 'You must be authenticated to access this resource'): Promise<void> {
  await this
    .code(StatusCodes.UNAUTHORIZED)
    .type('application/json')
    .send({
      message,
    });
}
