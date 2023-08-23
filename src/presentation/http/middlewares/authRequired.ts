import type { preHandlerHookHandler } from 'fastify';
import type AuthService from '@domain/service/auth.js';
import { StatusCodes } from 'http-status-codes';
import notEmpty from '@infrastructure/utils/notEmpty.js';

/**
 * Middleware for private routes
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
     * If authorization header is not present, return unauthorized response
     */
    if (!notEmpty(authorizationHeader)) {
      return reply
        .code(StatusCodes.UNAUTHORIZED)
        .send({
          message: 'Missing authorization header',
        });
    }

    /**
     * Extract token from authorization header
     */
    const token = authorizationHeader.replace('Bearer ', '');

    try {
      await authService.verifyAccessToken(token);

      done();
    } catch (error) {
      return reply
        .code(StatusCodes.UNAUTHORIZED)
        .send({
          message: 'Invalid access token',
        });
    }
  };
};
