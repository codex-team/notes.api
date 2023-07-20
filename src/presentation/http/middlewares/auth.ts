import { preHandlerHookHandler } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '@presentation/http/types/HttpResponse.js';

/**
 * Auth middleware verifies request authorization header
 *
 * @returns { preHandlerHookHandler } - auth middleware
 */
export default (): preHandlerHookHandler => {
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

    /**
     * TODO: verify token by specific service and pass payload to request
     */

    done();
  };
};
