import type { FastifyReply, FastifyRequest } from 'fastify';
import { isEmpty } from '@infrastructure/utils/empty.js';

/**
 * Policy to check whether a user has permission to edit the note
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export default async function userCanEdit(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { userId } = request;

  /**
   * If note is not resolved, we can't check permissions
   */
  if (isEmpty(request.note)) {
    return await reply.notAcceptable('Note not found');
  };

  const { creatorId } = request.note;
  const { memberRole } = request;

  /**
   * If user is not a creator of the note and
   * user has a Reader Role (0) or is not in team at all,
   * he doesn't have permission to edit the note
   */
  if (creatorId !== userId && memberRole !== 1) {
    return await reply.forbidden();
  }
}
