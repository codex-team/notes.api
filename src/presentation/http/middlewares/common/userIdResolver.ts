import type { FastifyInstance } from 'fastify';
import type AuthService from '@domain/service/auth.js';
import { notEmpty } from '@infrastructure/utils/empty.js';
import { getRequestLogger } from '@infrastructure/logging/index.js';
import { MCP_TOKEN_PREFIX } from '@domain/entities/mcpToken.js';

/**
 * Add middleware for resolve userId from Access Token and add it to request
 * @param server - fastify instance
 * @param authService - auth domain service
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
    const logger = getRequestLogger('middlewares').child({ middleware: 'userIdResolver' });
    const authorizationHeader = request.headers.authorization;

    if (notEmpty(authorizationHeader)) {
      const token = authorizationHeader.replace('Bearer ', '');

      /**
       * MCP tokens are resolved by the MCP endpoint itself and are not accepted by other routes
       */
      if (token.startsWith(MCP_TOKEN_PREFIX)) {
        done();

        return;
      }

      try {
        request.userId = authService.verifyAccessToken(token)['id'];
        logger.debug('User ID resolved from Access Token');
      } catch (error) {
        logger.error('Invalid Access Token');
        logger.error(error);
      }
    }
    done();
  });
}
