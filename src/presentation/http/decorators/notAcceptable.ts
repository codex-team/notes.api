import { StatusCodes } from 'http-status-codes';
import type { FastifyReply } from 'fastify';

/**
 * "406 Not Acceptable" helper
 *
 * This response is sent when the web server, after performing server-driven content negotiation, doesn't find any content following the criteria given by the user agent.
 * @example
 *
 *  if (note === null) {
 *    return reply.notAcceptable('Note not found');
 *  }
 * @param message - custom message
 */
export default async function notAcceptable(this: FastifyReply, message = 'Resource not found'): Promise<void> {
  await this
    .code(StatusCodes.NOT_ACCEPTABLE)
    .type('application/json')
    .send({
      message,
    });
}
