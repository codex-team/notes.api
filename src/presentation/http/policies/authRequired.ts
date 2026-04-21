import type { PolicyContext } from '@presentation/http/types/PolicyContext.js';
import { getRequestLogger } from '@infrastructure/logging/index.js';

/**
 * Policy to enforce user to be logged in
 * @param context - Context object, containing Fatify request, Fastify reply and domain services
 */
export default async function authRequired(context: PolicyContext): Promise<void> {
  const { request, reply } = context;
  const logger = getRequestLogger('policies').child({ policy: 'authRequired' });

  const { userId } = request;

  if (userId === null) {
    logger.warn('User is not authenticated');

    return await reply.unauthorized();
  }

  logger.debug('User authenticated');
}
