import type { FastifyPluginCallback } from 'fastify';
import type UserService from '@domain/service/user.js';
import { Provider } from '@domain/service/user.js';
import type AuthService from '@domain/service/auth.js';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse.js';
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

  /**
   * Cookie domain for refresh and access tokens
   */
  cookieDomain: string,
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
    /**
     * Get referer from request headers
     */
    const referer = request.headers.referer as string;
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

    /**
     * Show page with script passing parent window postMessage with tokens
     */
    reply.type('text/html').send(`
      <html>
        <head>
          <script>
            window.opener.postMessage({ accessToken: '${accessToken}', refreshToken: '${refreshToken}' }, '${referer}');
            window.close();
          </script>
        </head>
        <body>
          <p>You are awesome! ᕕ( ͡° ͜ʖ ͡°)ᕗ</p>
        </body>
      </html>
    `);
  });
  done();
};

export default OauthRouter;
