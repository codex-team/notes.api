import type { FastifyPluginCallback } from 'fastify';
import type AuthService from '@domain/service/auth.js';
import type { ErrorResponse, SuccessResponse } from '@presentation/http/types/HttpResponse.js';
import { StatusCodes } from 'http-status-codes';
import type Auth from '@domain/entities/auth.js';

/**
 * Interface for regenerate token request options.
 */
interface RegenerateTokenOptions {
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
    Querystring: RegenerateTokenOptions;
  }>('/', async (request, reply) => {
    const { token } = request.query;

    const userSession = await opts.authService.verifyRefreshToken(token);

    /**
     * Check if session is valid
     */
    if (!userSession) {
      const response: ErrorResponse = {
        status: StatusCodes.UNAUTHORIZED,
        message: 'Session is not valid',
      };

      reply.send(response);

      return;
    }

    const accessToken = opts.authService.signAccessToken({ id: userSession.userId });

    await opts.authService.removeSessionByRefreshToken(token);
    const refreshToken = await opts.authService.signRefreshToken(userSession.userId);

    const response: SuccessResponse<Auth> = {
      data: {
        accessToken,
        refreshToken,
      },
    };

    reply.send(response);
  });
  done();
};

export default AuthRouter;
