import { FastifyPluginCallback } from 'fastify';
import AuthService from '@domain/service/auth.js';
import { ErrorResponse } from '@presentation/http/types/HttpResponse.js';
import { StatusCodes } from 'http-status-codes';

interface RegenerateTokenOptions {
  token: string;
}

/**
 * Interface for the oauth router.
 */
interface OauthRouterOptions {

  /**
   * Auth service instance
   */
  authService: AuthService,
}

/**
 * OAuth router plugin
 *
 * @param fastify - fastify instance
 * @param opts - router options
 * @param done - callback
 */
const AuthRouter: FastifyPluginCallback<OauthRouterOptions> = (fastify, opts, done) => {
  /**
   * Callback for Google oauth2. Google redirects to this endpoint after user authentication.
   */
  fastify.get<{
    Params: RegenerateTokenOptions;
  }>('/regenerate', async (request, reply) => {
    const { token } = request.params;

    const user = await opts.authService.verifyRefreshToken(token);

    if (!user) {
      const response: ErrorResponse = {
        status: StatusCodes.UNAUTHORIZED,
        message: 'Session is not valid',
      };

      reply.status(StatusCodes.NOT_FOUND)
        .send(response);
      return;
    }

    const accessToken = opts.authService.signAccessToken({ id: user.id });
    await opts.authService.removeSessionByRefreshToken(token);
    const refreshToken = await opts.authService.signRefreshToken(user.id);

    reply.send({
      accessToken,
      refreshToken,
    });
    done();
  });
};

export default AuthRouter;
