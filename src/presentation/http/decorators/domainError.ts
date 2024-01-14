import { StatusCodes } from 'http-status-codes';
import type { FastifyReply } from 'fastify';

/**
 * Custom method for replying with information that business logic dismissed the request for some reason
 *
 * Send this error when a domain-level error is thrown
 *
 * @example
 *
 *  try {
 *    service.someAction()
 *  } catch (error: Error) {
 *    if (error instanceof DomainError) {
 *      reply.domainError(error.message);
 *      return;
 *    }
 *    throw error;
 *  }
 *
 * @param message - Optional message to send. If not specified, default message will be sent
 */
export default async function domainError(this: FastifyReply, message = 'Domain level error'): Promise<void> {
  await this
    .code(StatusCodes.BAD_REQUEST)
    .type('application/json')
    .send({
      message,
    });
}