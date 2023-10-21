import type { FastifyReply, FastifyRequest } from 'fastify';
import { StatusCodes } from 'http-status-codes';

/**
 * Policy to enforce user to be logged in
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export default async function checkPermission(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { userId } = request;

  if (!request.note || !request.noteSettings) {
    return await reply
      .code(StatusCodes.NOT_ACCEPTABLE)
      .send({
        message: 'Note not found',
      });
  };

  const { creatorId } = request.note;
  const { isPublic } = request.noteSettings;

  console.log('creatorId', creatorId);
  console.log('userId', userId);
  console.log('isPublic', isPublic);

  if (!isPublic && creatorId !== userId) {
    await reply
      .code(StatusCodes.UNAUTHORIZED)
      .send({
        message: 'Permission denied',
      });
  }
}