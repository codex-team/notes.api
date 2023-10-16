/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
import type * as fastify from 'fastify';
import type * as http from 'http';

declare module 'fastify' {
  export interface FastifyInstance<
    HttpServer = http.Server,
    HttpRequest = http.IncomingMessage,
    HttpResponse = http.ServerResponse
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
}