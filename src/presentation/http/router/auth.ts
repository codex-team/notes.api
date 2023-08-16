import type { FastifyPluginCallback } from 'fastify';
import type AuthService from '@domain/service/auth.js';
import type { ErrorResponse, SuccessResponse } from '@presentation/http/types/HttpResponse.js';
import { StatusCodes } from 'http-status-codes';
import type AuthSession from '@domain/entities/authSession.js';

/**
 * Interface for auth request options. Uses for regenerate tokens and logout.
 */
interface AuthOptions {
  /**
   * Refresh token
   */
  token: string;
}

/**
 * Interface for the Auth router.
 */
interface AuthRouterOptions {

  /**
   * Auth service instance
   */
  authService: AuthService,
}

/**
 * Auth router plugin
 *
 * @param fastify - fastify instance
 * @param opts - router options
 * @param done - callback
 */
const AuthRouter: FastifyPluginCallback<AuthRouterOptions> = (fastify, opts, done) => {
  /**
   * Regenerate access end refresh tokens by refresh token
   */
  fastify.post<{
    Body: AuthOptions;
  }>('/', async (request, reply) => {
    const { token } = request.body;

    const userSession = await opts.authService.verifyRefreshToken(token);

    /**
     * Check if session is valid
     */
    if (!userSession) {
      const response: ErrorResponse = {
        status: StatusCodes.UNAUTHORIZED,
        message: 'Session is not valid',
      };

      return reply.send(response);
    }

    const accessToken = opts.authService.signAccessToken({ id: userSession.userId });

    await opts.authService.removeSessionByRefreshToken(token);
    const refreshToken = await opts.authService.signRefreshToken(userSession.userId);

    const response: SuccessResponse<AuthSession> = {
      data: {
        accessToken,
        refreshToken,
      },
    };

    return reply.send(response);
  });

  /**
   * Route for logout, removes session from database by refresh token
   */
  fastify.delete<{
    Body: AuthOptions;
  }>('/', async (request, reply) => {
    await opts.authService.removeSessionByRefreshToken(request.body.token);

    const response: SuccessResponse<string> = {
      data: 'OK',
    };

    await reply.status(StatusCodes.OK).send(response);
  });
  done();
};

export default AuthRouter;
