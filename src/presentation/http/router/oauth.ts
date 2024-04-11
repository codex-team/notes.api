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

      response:{
        '2xx': {
          accessToken: {
            $ref: 'OauthSchema#/properties/accessToken',
          },
          refreshToken: {
            $ref: 'OauthSchema#/properties/refreshToken',
          },
        },

        '3xx': {
          code: {
            type: 'string',
          },

          message: {
            type: 'string',
          },
        },

        '5xx': {
          code: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
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
     * Show page with script passing parent window postMessage with tokens
     */
    return reply.type('text/html').send(`
      <html>
        <head>
          <script>
            window.opener.postMessage({ accessToken: '${accessToken}', refreshToken: '${refreshToken}' }, '*');
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
