import type { FastifyPluginCallback } from 'fastify';
import type AuthService from '@domain/service/auth.js';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse.js';
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
    Reply: AuthSession | ErrorResponse;
  }>('/',
    {
      schema: {
        body: {
          required: [ 'token' ],
          properties: {
            token: {
              type: 'string',
            },
          },
        },

        response: {
          '2xx': {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },

          '5xx': {
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { token } = request.body;
      const userSession = await opts.authService.verifyRefreshToken(token);

      /**
       * Check if session is valid
       */
      if (!userSession) {
        return await reply.unauthorized('Session is not valid');
      }

      const accessToken = opts.authService.signAccessToken({ id: userSession.userId });

      await opts.authService.removeSessionByRefreshToken(token);
      const refreshToken = await opts.authService.signRefreshToken(userSession.userId);

      return reply.send({
        accessToken,
        refreshToken,
      });
    });

  /**
   * Route for logout, removes session from database by refresh token
   */
  fastify.delete<{
    Body: AuthOptions;
    Reply: { ok: boolean }
  }>('/', {
    schema: {
      body: {
        token: {
          type: 'string',
        },
      },

      response: {
        '2xx': {
          content: {
            schema:{
              ok: {
                type: 'boolean',
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    await opts.authService.removeSessionByRefreshToken(request.body.token);

    return reply.status(StatusCodes.OK).send({
      ok: true,
    });
  });
  done();
};

export default AuthRouter;
