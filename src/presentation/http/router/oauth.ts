import type { FastifyPluginCallback } from 'fastify';
import type UserService from '@domain/service/user.js';
import { Provider } from '@domain/service/user.js';
import type AuthService from '@domain/service/auth.js';
import type { ErrorResponse, SuccessResponse } from '@presentation/http/types/HttpResponse.js';
import { StatusCodes } from 'http-status-codes';
import type Auth from '@domain/entities/auth';

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

    /**
     * Check if user exists
     */
    if (!user) {
      const response: ErrorResponse = {
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      };

      reply.send(response);

      return;
    }

    /**
     * Generate tokens
     */
    const accessToken = opts.authService.signAccessToken({ id: user.id });
    const refreshToken = await opts.authService.signRefreshToken(user.id);

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

export default OauthRouter;
