import type { FastifyPluginCallback } from 'fastify';
import type UserService from '@domain/service/user.js';
import { Provider } from '@domain/service/user.js';
import type AuthService from '@domain/service/auth.js';

/**
 * Interface for the oauth router.
 */
interface OauthRouterOptions {
  /**
   * User service instance
   */
  userService: UserService;

  /**
   * Auth service instance
   */
  authService: AuthService;

  /**
   * Cookie domain for refresh and access tokens
   */
  cookieDomain: string;

  /**
   * Exact origins of the web app allowed to receive tokens via postMessage
   */
  webOrigins: string[];
}

/**
 * OAuth router plugin
 * @param fastify - fastify instance
 * @param opts - router options
 * @param done - callback
 */
const OauthRouter: FastifyPluginCallback<OauthRouterOptions> = (fastify, opts, done) => {
  if (opts.webOrigins.length === 0) {
    fastify.log.warn('httpApi.webOrigins is empty, so Google login will not pass tokens to the web app');
  }

  /**
   * Callback for Google oauth2. Google redirects to this endpoint after user authentication.
   */
  fastify.get('/google/callback', {
    schema: {
      params: {
        clientId: {
          $ref: 'OauthSchema#/properties/clientId',
        },
        clientSecret: {
          $ref: 'OauthSchema#/properties/clientSecret',
        },
      },
    },
  }, async (request, reply) => {
    /**
     * Get referer from request headers
     */
    const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

    const user = await opts.userService.getUserByProvider(token.access_token, Provider.GOOGLE);

    /**
     * Check if user exists
     */
    if (!user) {
      return reply.notFound('User not found');
    }

    /**
     * Generate tokens
     */
    const accessToken = opts.authService.signAccessToken({ id: user.id });
    const refreshToken = await opts.authService.signRefreshToken(user.id);

    /**
     * Never use '*' as target origin: any site could open the login popup and receive the tokens.
     * Browser delivers the message only when the opener origin exactly matches one of the allowed origins
     */
    const message = JSON.stringify({
      accessToken,
      refreshToken,
    });
    const targetOrigins = JSON.stringify(opts.webOrigins);

    /**
     * Show page with script passing parent window postMessage with tokens
     */
    return reply.type('text/html').send(`
      <html>
        <head>
          <script>
            if (window.opener) {
              ${targetOrigins}.forEach(function (origin) {
                window.opener.postMessage(${message}, origin);
              });
            }
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
