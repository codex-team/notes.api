import type { FastifyPluginCallback } from 'fastify';
import type UserService from '@domain/service/user.js';
import { Provider } from '@domain/service/user.js';
import type AuthService from '@domain/service/auth.js';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse';
import { StatusCodes } from 'http-status-codes';

/**
 * Interface for the oauth router.
 */
interface OauthRouterOptions {
  /**
   * User service instance
   */
  userService: UserService,

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
const OauthRouter: FastifyPluginCallback<OauthRouterOptions> = (fastify, opts, done) => {
  /**
   * Callback for Google oauth2. Google redirects to this endpoint after user authentication.
   */
  fastify.get('/google/callback', async (request, reply) => {
    const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

    const user = await opts.userService.getUserByProvider(token.access_token, Provider.GOOGLE);

    if (!user) {
      const response: ErrorResponse = {
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      };

      reply.status(StatusCodes.NOT_FOUND).send(response);
      return;
    }

    const accessToken = opts.authService.signAccessToken({ id: user.id });
    const refreshToken = opts.authService.signRefreshToken(user.id);
    /**
     * TODO: generate jwt token, add session, set cookie and redirect to frontend
     */

    reply.send({
      accessToken,
      refreshToken,
    });
  });
  done();
};

export default OauthRouter;
