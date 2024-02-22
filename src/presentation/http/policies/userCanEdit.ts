import type { FastifyReply, FastifyRequest } from 'fastify';
import { isEmpty } from '@infrastructure/utils/empty.js';
import { MemberRole } from '@domain/entities/team';

/**
 * Policy to check whether a user has permission to edit the note
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export default async function userCanEdit(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { userId } = request;

  /**
   * If user is not authorized, we can't check his permissions
   */
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
  const { memberRole } = request;

  /**
   * If user is not a creator of the note and
   * user has a Read Role or is not in team at all,
   * he doesn't have permission to edit the note
   */
  if (creatorId !== userId && memberRole !== MemberRole.Write) {
    return await reply.forbidden();
  }
}
