import { FastifyPluginCallback } from 'fastify';
import NoteService, { AddNoteOptions } from '@domain/service/note.js';

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
  fastify.post('/', async (request, reply) => {
    /**
     * TODO: Validate request query
     */
    const options = request.query as AddNoteOptions;

    reply.send(NoteService.addNote(options));
  });

  done();
};

export default NoteRouter;
