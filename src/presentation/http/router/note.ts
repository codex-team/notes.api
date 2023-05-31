import { FastifyPluginCallback } from 'fastify';
import NoteService, { AddNoteOptions } from '@domain/service/note.js';

/**
 * Interface for the note router.
 */
interface NoteRouterOptions {
  /**
   * Note service instance
   */
  noteService: NoteService,
}

/**
 * Note router plugin
 *
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const NoteRouter: FastifyPluginCallback<NoteRouterOptions> = (fastify, opts, done) => {
  /**
   * Get note service from options
   */
  const noteService = opts.noteService;

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

    reply.send(noteService.addNote({
      title: options.title,
      content: options.content,
    }));
  });

  done();
};

export default NoteRouter;
