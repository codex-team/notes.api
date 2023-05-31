import { FastifyPluginCallback } from 'fastify';
import NoteService from '@domain/service/note.js';

/**
 * Note router plugin
 *
 * @param fastify - fastify instance
 * @param _ - empty options
 * @param done - callback
 */
const NoteRouter: FastifyPluginCallback = (fastify, _, done) => {
  /**
   * Get notes
   */
  fastify.get('/', async () => {
    return { hello: 'world' };
  });

  /**
   * Add new note
   */
  fastify.post('/add', async (request, reply) => {
    reply.send(NoteService.addNote(request.query));
  });

  done();
};

export default NoteRouter;
