import { OAuth2Namespace } from '@fastify/oauth2';
import { HttpRequestConfigContext } from '@presentation/http/types/HttpRequest.js';
import { AuthPayload } from '@domain/service/auth.js';

declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
  interface FastifyRequest {
    ctx: HttpRequestConfigContext<AuthPayload>
  }
}
