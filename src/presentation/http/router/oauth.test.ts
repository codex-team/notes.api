import { describe, test, expect, vi } from 'vitest';
import { runInNewContext } from 'node:vm';
import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import type { OAuth2Namespace } from '@fastify/oauth2';
import type UserService from '@domain/service/user.js';
import type AuthService from '@domain/service/auth.js';
import { OauthSchema } from '@presentation/http/schema/OauthSchema.js';
import { notFound } from '@presentation/http/decorators/index.js';
import OauthRouter from '@presentation/http/router/oauth.js';

const accessToken = 'access-token';
const refreshToken = 'refresh-token';

/**
 * Creates server with oauth router only. Google token exchange and user lookup are stubbed
 * @param webOrigins - origins allowed to receive tokens
 * @param user - user returned by provider lookup
 */
async function createServer(webOrigins: string[], user: { id: number } | null = { id: 1 }): Promise<FastifyInstance> {
  const server = fastify();

  server.decorate('googleOAuth2', {
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    getAccessTokenFromAuthorizationCodeFlow: vi.fn().mockResolvedValue({ token: { access_token: 'google-access-token' } }),
  } as unknown as OAuth2Namespace);
  server.decorateReply('notFound', notFound);
  server.addSchema(OauthSchema);

  await server.register(OauthRouter, {
    prefix: '/oauth',
    userService: {
      getUserByProvider: vi.fn().mockResolvedValue(user),
    } as unknown as UserService,
    authService: {
      signAccessToken: vi.fn().mockReturnValue(accessToken),
      signRefreshToken: vi.fn().mockResolvedValue(refreshToken),
    } as unknown as AuthService,
    cookieDomain: 'localhost',
    webOrigins,
  });

  return server;
}

/**
 * Runs script of the callback page against fake opener window
 * @param html - page returned by the callback endpoint
 * @returns arguments of every postMessage call
 */
function runCallbackPage(html: string): unknown[][] {
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';
  const postMessage = vi.fn();

  runInNewContext(script, {
    window: {
      opener: { postMessage },
      close: vi.fn(),
    },
  });

  return postMessage.mock.calls;
}

describe('OAuth API', () => {
  describe('GET /oauth/google/callback', () => {
    test('Posts tokens only to the configured web origin', async () => {
      const server = await createServer(['https://notex.so']);

      const response = await server.inject({
        method: 'GET',
        url: '/oauth/google/callback',
      });

      expect(response.statusCode).toBe(200);
      expect(runCallbackPage(response.body)).toEqual([
        [
          {
            accessToken,
            refreshToken,
          },
          'https://notex.so',
        ],
      ]);
    });

    test('Posts tokens to each configured web origin exactly, never to "*"', async () => {
      const server = await createServer(['https://notex.so', 'http://localhost:5173']);

      const response = await server.inject({
        method: 'GET',
        url: '/oauth/google/callback',
      });

      const targetOrigins = runCallbackPage(response.body).map(([, origin]) => origin);

      expect(targetOrigins).toEqual(['https://notex.so', 'http://localhost:5173']);
    });

    test('Does not post tokens when no web origins are configured', async () => {
      const server = await createServer([]);

      const response = await server.inject({
        method: 'GET',
        url: '/oauth/google/callback',
      });

      expect(response.statusCode).toBe(200);
      expect(runCallbackPage(response.body)).toEqual([]);
    });

    test('Returns 404 without tokens when user is not found', async () => {
      const server = await createServer(['https://notex.so'], null);

      const response = await server.inject({
        method: 'GET',
        url: '/oauth/google/callback',
      });

      expect(response.statusCode).toBe(404);
      expect(response.body).not.toContain(accessToken);
      expect(response.body).not.toContain(refreshToken);
    });
  });
});
