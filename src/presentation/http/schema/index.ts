import type { FastifyInstance } from 'fastify';
import type * as http from 'http';
import type { pino } from 'pino';
import { UserSchema } from './User.js';

/**
 * Adds schemas to fastify instance
 *
 * @param fastify - server instance
 */
export function addSchema(fastify: FastifyInstance<http.Server, http.IncomingMessage, http.ServerResponse, pino.Logger>): void {
  fastify.addSchema(UserSchema);
}
