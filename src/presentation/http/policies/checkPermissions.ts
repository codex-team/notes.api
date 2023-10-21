import type { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

/**
 * Policy to check does user have permission to access note
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export default async function checkPermission(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { userId } = request;

  /**
   * If note or noteSettings not resolved, we can't check permissions
   */
  if (!request.note || !request.noteSettings) {
    return await reply
      .code(StatusCodes.NOT_ACCEPTABLE)
      .send({
        message: 'Note not found',
      });
  };

  const { creatorId } = request.note;
  const { isPublic } = request.noteSettings;

  /**
   * If note is public, everyone can access it
   * If note is private, only creator can access it
   */
  if (!isPublic && creatorId !== userId) {
    await reply
      .code(StatusCodes.UNAUTHORIZED)
      .send({
        message: 'Permission denied',
      });
  }
}