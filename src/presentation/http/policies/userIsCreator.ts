import type { FastifyReply, FastifyRequest } from 'fastify';
import { isEmpty } from '@infrastructure/utils/empty.js';


/**
 * Policy to check whether a user is a creator of the note
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export default async function userIsCreator(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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
