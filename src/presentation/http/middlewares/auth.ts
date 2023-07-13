import { preHandlerHookHandler } from 'fastify';
import AuthService, { AuthPayload } from '@domain/service/auth';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '@presentation/http/types/HttpResponse';
import { HttpRequestParams } from '@presentation/http/types/HttpRequest';

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
     * If authorization header is not present, return unauthorized response
     */
    if (!authorizationHeader) {
      const response: ErrorResponse = {
        status: StatusCodes.UNAUTHORIZED,
        message: 'Missing authorization header',
      };

      reply.send(response);

      return;
    }

    const token = authorizationHeader.replace('Bearer ', '');

    try {
      const tokenPayload = await authService.verifyAccessToken(token);

      /**
       * Cast token payload to HttpRequest<Payload>
       */
      const params = request.params as HttpRequestParams<AuthPayload>;

      /**
       * Merge token payload with request params
       */
      request.params = {
        ...params,
        auth: tokenPayload,
      };
      done();
    } catch (error) {
      const response: ErrorResponse = {
        status: StatusCodes.UNAUTHORIZED,
        message: 'Invalid access token',
      };

      reply.send(response);
    }
  };
};
