import type { FastifyPluginCallback } from 'fastify';
import type UserService from '@domain/service/user.js';
import { Provider } from '@domain/service/user.js';

/**
 * Interface for the oauth router.
 */
interface OauthRouterOptions {
  /**
   * User service instance
   */
  userService: UserService,
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
     * TODO: generate jwt token, add session, set cookie and redirect to frontend
     */
    reply.send(user);
  });
  done();
};

export default OauthRouter;
