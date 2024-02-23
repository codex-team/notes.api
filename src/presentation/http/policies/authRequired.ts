import type { PolicyContext } from '@presentation/http/types/PolicyContext';

/**
 * Policy to enforce user to be logged in
 *
 * @param context - Context object, containing Fatify request, Fastify reply and domain services
 */
export default async function authRequired(context: PolicyContext): Promise<void> {
  const { request, reply } = context;

  const { userId } = request;

  if (userId === null) {
    return await reply.unauthorized();
  }
}
