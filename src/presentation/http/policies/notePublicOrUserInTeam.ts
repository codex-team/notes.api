import type { FastifyReply, FastifyRequest } from 'fastify';
import { isEmpty } from '@infrastructure/utils/empty.js';
import type { DomainServices } from '@domain/index.js';

/**
 * Policy to check does user have permission to access note
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 * @param domainServices - instances of domain services
 */
export default async function notePublicOrUserInTeam(request: FastifyRequest, reply: FastifyReply, domainServices: DomainServices): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { userId } = request;

  /**
   * If note or noteSettings not resolved, we can't check permissions
   */
  if (isEmpty(request.note) || isEmpty(request.noteSettings)) {
    return await reply.notAcceptable('Note not found');
  };

  const { creatorId } = request.note;
  const { isPublic } = request.noteSettings;
  const { memberRole } = request;

  /**
   * If note is public, everyone can access it
   * If note is private, only team member and creator can access it
   */
  if (isPublic === false && creatorId !== userId && isEmpty(memberRole)) {
    return await reply.forbidden();
  }
}
