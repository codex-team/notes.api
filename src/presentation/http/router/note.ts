import { FastifyPluginCallback } from 'fastify';
import NoteService, { AddNoteOptions, GetNoteByIdOptions } from '@domain/service/note.js';
import { StatusCodes } from 'http-status-codes';

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
   * Get note by id
   */
  fastify.get<{ Params: GetNoteByIdOptions }>('/:id', async (request, reply) => {
    const params = request.params;

    const note = await noteService.getNoteById(params);

    /**
     * Check if note does not exist
     */
    if (!note) {
      const payload = {
        message: 'Note not found',
      };

      return reply.code(StatusCodes.NOT_FOUND).send(payload);
    }

    return reply.code(StatusCodes.OK).send(note);
  });

  /**
   * Add new note
   */
  fastify.post('/', async (request, reply) => {
    /**
     * TODO: Validate request query
     */
    const options = request.query as AddNoteOptions;

    const addedNote = await noteService.addNote(options);

    return reply.code(StatusCodes.CREATED).send(addedNote);
  });
  done();
};

export default NoteRouter;
