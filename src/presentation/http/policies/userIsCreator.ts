import type { FastifyReply, FastifyRequest } from 'fastify';
import { isEmpty } from '@infrastructure/utils/empty.js';
import type { DomainServices } from '@domain/index.js';


/**
 * Policy to check whether a user is a creator of the note
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 * @param domainServices - instances of domain services
 */
export default async function userIsCreator(request: FastifyRequest, reply: FastifyReply, domainServices: DomainServices): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { userId } = request;

  if (isEmpty(userId)) {
    return await reply.unauthorized();
  };

  /**
   * If note is not resolved, we can't check permissions
   */
  if (isEmpty(request.note)) {
    return await reply.notAcceptable('Note not found');
  };

  const { creatorId } = request.note;

  /**
   * Check if user is a creator of the note
   */
  if (creatorId !== userId) {
    return await reply.forbidden();
  }
}
