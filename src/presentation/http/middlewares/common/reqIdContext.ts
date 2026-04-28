import type { FastifyInstance } from 'fastify';
import { requestContextStorage } from '@infrastructure/logging/reqId.context.js';

/**
 * Adds middleware to set reqId context at the beginning of each request
 * @param server - fastify instance
 */
export default function addReqIdContext(server: FastifyInstance): void {
  /**
   * Sets reqId context for all asynchronous operations within the request
   * Uses 'onRequest' hook so context is available in all subsequent hooks and handlers
   */
  server.addHook('onRequest', (request, _reply, done) => {
    requestContextStorage.run({ reqId: request.id }, () => {
      done();
    });
  });
}
