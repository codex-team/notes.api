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

  /**
   * Cookie domain for refresh token
   */
  cookieDomain: string,
}

/**
 * Auth router plugin
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
          required: ['token'],
          properties: {
            token: {
              type: 'string',
            },
          },
        },

        response: {
          '2xx': {
            description: 'New auth session generated',
            content: {
              'application/json': {
                schema: {
                  accessToken: { type: 'string' },
                  refreshToken: { type: 'string' },
                },
              },
            },
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
      await opts.authService.removeSessionByRefreshToken(token);
      const { refreshToken, expiresAt } = await opts.authService.signRefreshToken(userSession.userId);

<<<<<<< HEAD
      return reply
        .setCookie('refreshToken', refreshToken, {
          path: '/auth',
          httpOnly: true,
          expires: expiresAt,
        })
        .send({
          accessToken,
          refreshToken,
        });
    });
=======
    await opts.authService.removeSessionByRefreshToken(token);
    const { refreshToken, expiresAt } = await opts.authService.signRefreshToken(userSession.userId);

    return reply
      .setCookie('refreshToken', refreshToken, {
        path: '/auth',
        httpOnly: true,
        expires: expiresAt,
        domain: opts.cookieDomain,
      })
      .send({
        accessToken,
        refreshToken,
      });
  });
>>>>>>> 084b0b1 (Add domain property to refresh token cookie)

  /**
   * Route for logout, removes session from database by refresh token
   */
  fastify.delete<{
    Body: AuthOptions;
    Reply: { ok: boolean };
  }>('/', {
    schema: {
      body: {
        token: {
          type: 'string',
        },
      },

      response: {
        '2xx': {
          description: 'Check for successful deletion of the token',
          content: {
            'application/json': {
              schema: {
                ok: {
                  type: 'boolean',
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    await opts.authService.removeSessionByRefreshToken(request.body.token);

    return reply
      .clearCookie('refreshToken', {
        path: '/auth',
        domain: opts.cookieDomain,
      })
      .status(StatusCodes.OK)
      .send({
        ok: true,
      });
  });
  done();
};

export default AuthRouter;
