import { FastifyPluginCallback } from 'fastify';

/**
 * OAuth router plugin
 *
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const OauthRouter: FastifyPluginCallback = (fastify, opts, done) => {
  /**
   * Callback for Google oauth2
   */
  fastify.get('/google/callback', async (request, reply) => {
    const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

    reply.send(token.access_token);
  });
  done();
};

export default OauthRouter;
