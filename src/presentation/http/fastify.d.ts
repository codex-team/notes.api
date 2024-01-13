/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
import type * as fastify from 'fastify';
import type * as http from 'http';
import type { pino } from 'pino';
import type Policies from './policies/index.js';
import type AuthPayload from '@domain/entities/authPayload.js';
import type { Note } from '@domain/entities/note.js';
import type NoteSettings from '@domain/entities/noteSettings.js';

declare module 'fastify' {
  export interface FastifyInstance<
    RawServer extends fastify.RawServerBase = fastify.RawServerDefault,
    RawRequest extends fastify.RawRequestDefaultExpression<RawServer> = fastify.RawRequestDefaultExpression<RawServer>,
    RawReply extends fastify.RawReplyDefaultExpression<RawServer> = fastify.RawReplyDefaultExpression<RawServer>,
    Logger extends fastify.FastifyBaseLogger = fastify.FastifyBaseLogger,
    TypeProvider extends fastify.FastifyTypeProvider = fastify.FastifyTypeProviderDefault,
  > {
    // put here your custom properties and methods of fastify server instance added by decorators
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
     * This property added by noteResolver middleware
     */
    note: Note | null;

    /**
     * This property added by noteSettingsResolver middleware
     */
    noteSettings: NoteSettings | null;
  }

  /**
   * Augment FastifyReply to respect properties added by decorators
   */
  export interface FastifyReply {
    /**
     * Custom method for sending 404 error
     *
     * @example
     *
     *  if (note === null) {
     *    return reply.notFound('Note not found');
     *  }
     *
     * @param message - Optional message to send. If not specified, default message will be sent
     */
    notFound: (message?: string) => Promise<void>;

    /**
     * Custom method for sending 403 error
     *
     * Send this error when USER IS AUTHENTICATED, but he doesn't have access to the resource
     *
     * @example
     *
     *  if (note.creatorId !== userId) {
     *    return reply.forbidden('You don\'t have access to this note');
     *  }
     *
     * @param message - Optional message to send. If not specified, default message will be sent
     */
    forbidden: (message?: string) => Promise<void>;

    /**
     * Custom method for sending 401 error
     *
     * Send this error when USER IS NOT AUTHENTICATED and he doesn't have access to the resource because of that
     *
     * @example
     *
     *  if (userId === null) {
     *    return reply.unauthorized('You must be authenticated to access this resource');
     *  }
     *
     * @param message - Optional message to send. If not specified, default message will be sent
     */
    unauthorized: (message?: string) => Promise<void>;

    /**
     * Custom method for sending 406 error
     *
     * This response is sent when the web server, after performing server-driven content negotiation, doesn't find any content following the criteria given by the user agent.
     *
     * @example
     *
     *  if (note === null) {
     *    return reply.notAcceptable('Note not found');
     *  }
     *
     * @param message - Optional message to send. If not specified, default message will be sent
     */
    notAcceptable: (message?: string) => Promise<void>;

    /**
     * Custom method for sending 400 error
     *
     * Send this error when a domain-level error is thrown
     *
     * @example
     *
     *  try {
     *    if (updatedNote === null) {
     *      throw new DomainError(`Note with id ${id} was not updated`);
     *  } catch (error: DomainError) {
     *      reply.domainError(error.message);
     * }
     *
     * @param message - Optional message to send. If not specified, default message will be sent
     */
    domainError: (message?: string) => Promise<void>;
  }
}
