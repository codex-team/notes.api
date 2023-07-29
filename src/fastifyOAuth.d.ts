import type { OAuth2Namespace } from '@fastify/oauth2';
import type { HttpRequestContext } from '@presentation/http/types/HttpRequestContext.js';

declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
  interface FastifyRequest {
    /**
     * Request context, passed from middlewares, when request is authorized
     */
    ctx?: HttpRequestContext;
  }
}
