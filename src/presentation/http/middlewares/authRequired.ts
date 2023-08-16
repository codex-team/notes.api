import type { preHandlerHookHandler } from 'fastify';
import type AuthService from '@domain/service/auth.js';
import { StatusCodes } from 'http-status-codes';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse.js';
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
      const response: ErrorResponse = {
        status: StatusCodes.UNAUTHORIZED,
        message: 'Missing authorization header',
      };

      return reply.send(response);
    }

    /**
     * Extract token from authorization header
     */
    const token = authorizationHeader.replace('Bearer ', '');

    try {
      await authService.verifyAccessToken(token);

      done();
    } catch (error) {
      const response: ErrorResponse = {
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid access token',
      };

      return reply.send(response);
    }
  };
};
