import { OAuth2Namespace } from '@fastify/oauth2';
import { HttpRequestConfigContext } from '@presentation/http/types/HttpRequestContext.js';

declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
  interface FastifyRequest {
    /**
     * Request context, passed from middlewares
     */
    ctx: HttpRequestConfigContext;
  }
}
