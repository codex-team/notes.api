import type { preHandlerHookHandler } from 'fastify';
import type AuthService from '@domain/service/auth.js';

/**
 * Auth middleware
 *
 * @param authService - auth service instance
 * @returns { preHandlerHookHandler } - auth middleware
 */
export default (authService: AuthService): preHandlerHookHandler => {
  /**
   * Middleware function
   *
   * @param request - request object
   * @param reply - reply object
   * @param done - done callback
   */
  return async (request, reply, done) => {
    const authorizationHeader = request.headers.authorization;

    /**
     * If authorization header is not present, skip auth middleware
     */
    if (!authorizationHeader) {
      done();

      return;
    }

    /**
     * Extract token from authorization header
     */
    const token = authorizationHeader.replace('Bearer ', '');

    try {
      const tokenPayload = await authService.verifyAccessToken(token);

      /**
       * Add route config with auth payload to request context
       */
      request.ctx = {
        auth: tokenPayload,
      };
    } finally {
      /**
       * Continue request lifecycle
       */
      done();
    }
  };
};
