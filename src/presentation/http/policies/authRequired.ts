import type { FastifyReply, FastifyRequest } from 'fastify';
import type { DomainServices } from '@domain/index.js';

/**
 * Policy to enforce user to be logged in
 *
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 * @param domainServices - instances of domain services
 * eslint no-used-vars: "domainServices"
 * exported DomainServices
 */
export default async function authRequired(request: FastifyRequest, reply: FastifyReply, domainServices: DomainServices): Promise<void> { // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { userId } = request;

  if (userId === null) {
    return await reply.unauthorized();
  }
}
