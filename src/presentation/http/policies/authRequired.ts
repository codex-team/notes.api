import type { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Policy to enforce user to be logged in
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 */
export default async function authRequired(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { userId } = request;

  if (userId === null) {
    return await reply.unauthorized();
  }
}
