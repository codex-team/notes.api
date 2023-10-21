import type { FastifyReply, FastifyRequest } from 'fastify';
import { isEmpty } from '@infrastructure/utils/empty.js';


/**
 * Policy to check whether user in a team of note
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export default async function notePublicOrUserInTeam(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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
   * If note is public, everyone can access it
   * If note is private, only creator can access it
   */
  if (creatorId !== userId) {
    return await reply.forbidden();
  }
}
