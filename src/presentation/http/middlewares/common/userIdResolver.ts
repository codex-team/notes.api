import type { FastifyInstance } from 'fastify';
import type AuthService from '@domain/service/auth.js';
import { notEmpty } from '@infrastructure/utils/empty.js';
import { getRequestLogger } from '@infrastructure/logging/index.js';

/**
 * Add middleware for resolve userId from Access Token and add it to request
 * @param server - fastify instance
 * @param authService - auth domain service
 * @param logger - logger instance
 */
export default function addUserIdResolver(server: FastifyInstance, authService: AuthService): void {
  /**
   * Default userId value — null
   */
  server.decorateRequest('userId', null);

  /**
   * Resolve userId from Access Token on each request
   */
  server.addHook('preHandler', (request, _reply, done) => {
    const logger = getRequestLogger('middlewares', request);
    const authorizationHeader = request.headers.authorization;

    if (notEmpty(authorizationHeader)) {
      const token = authorizationHeader.replace('Bearer ', '');

      try {
        request.userId = authService.verifyAccessToken(token)['id'];
      } catch (error) {
        logger.error('Invalid Access Token');
        logger.error(error);
      }
    }
    done();
  });
}
