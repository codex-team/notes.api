import type { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { StatusCodes } from 'http-status-codes';

/**
 * Policy to enforce user to be logged in
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 * @param done - done callback
 */
export default async function authRequired(request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction): Promise<void> {
  const { userId } = request;

  if (userId === null) {
    await reply
      .code(StatusCodes.UNAUTHORIZED)
      .send({
        message: 'Permission denied',
      });
  }

  done();
}
