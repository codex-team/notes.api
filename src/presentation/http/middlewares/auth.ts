import type { FastifyInstance } from 'fastify';
import type AuthService from '@domain/service/auth';
import type Logger from '@infrastructure/logging/index.js';
import notEmpty from '@infrastructure/utils/notEmpty';


/**
 *
 * @param server
 * @param authService
 * @param logger
 */
export default function addAuthMiddleware(server: FastifyInstance, authService: AuthService, logger: typeof Logger ): void {
  /**
   * Default userId value — null
   */
  server.decorateRequest('userId', null);

  /**
   * Resolve userId from Access Token on each request
   */
  server.addHook('preHandler', (request, _reply, done) => {
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
