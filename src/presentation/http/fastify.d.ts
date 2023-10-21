/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
import type * as fastify from 'fastify';
import type * as http from 'http';
import type { pino } from 'pino';
import type Policies from './policies/index.js';
import type AuthPayload from '@domain/entities/authPayload.js';

declare module 'fastify' {
  export interface FastifyInstance<
    RawServer extends fastify.RawServerBase = fastify.RawServerDefault,
    RawRequest extends fastify.RawRequestDefaultExpression<RawServer> = fastify.RawRequestDefaultExpression<RawServer>,
    RawReply extends fastify.RawReplyDefaultExpression<RawServer> = fastify.RawReplyDefaultExpression<RawServer>,
    Logger extends fastify.FastifyBaseLogger = fastify.FastifyBaseLogger,
    TypeProvider extends fastify.FastifyTypeProvider = fastify.FastifyTypeProviderDefault,
  > {
    /**
     * Custom method for sending 404 error
     *
     * @example
     *
     *  if (note === null) {
     *    return fastify.notFound(reply, 'Note not found');
     *  }
     *
     * @param reply - Fastify reply object
     * @param message - Optional message to send. If not specified, default message will be sent
     */
    notFound: (reply: fastify.FastifyReply, message?: string) => Promise<void>;
  }
  /**
   * Type shortcut for fastify server instance
   */
  type FastifyServer = FastifyInstance<http.Server, http.IncomingMessage, http.ServerResponse, pino.Logger>;

  /**
   * Augment FastifyRequest.routeConfig to respect "policy" property
   */
  export interface FastifyContextConfig {
    /**
     * Policy names to apply to the route
     *
     * @example
     *
     *    fastify.post('/note', {
     *      config: {
     *        policy: [
     *          'authRequired',
     *        ],
     *      },
     *    }, async (request, reply) => {
     *      // ...
     *    })
     */
    policy?: Array<keyof typeof Policies>;
  }

  /**
   * Augment FastifyRequest to respect properties added by middlewares
   */
  export interface FastifyRequest {
    /**
     * This property added by userIdResolver middleware
     */
    userId: AuthPayload['id'] | null;

    /**
     * This property added by noteIdResolver middleware
     */
    noteId: number | undefined;
  }
}
