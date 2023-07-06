import { FastifyPluginCallback } from 'fastify';
import NoteService from '@domain/service/note.js';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse, SuccessResponse } from '@presentation/http/types/HttpResponse';
import Note from '@domain/entities/note';

/**
 * Get note by id options
 */
interface GetNoteByIdOptions {
  /**
   * Note id
   */
  id: number;
}

/**
 * Add note options
 */
interface AddNoteOptions {
  /**
   * Note title
   */
  title: string;

  /**
   * Note content
   */
  content: string;
}

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

    /**
     * TODO: Validate request params
     */
    const { id } = params;

    const note = await noteService.getNoteById(id);

    /**
     * Check if note does not exist
     */
    if (!note) {
      const response: ErrorResponse = {
        code: StatusCodes.NOT_FOUND,
        message: 'Note not found',
      };

      return reply.send(response);
    }

    /**
     * Create success response
     */
    const response: SuccessResponse<Note> = {
      data: note,
    };

    return reply.send(response);
  });

  /**
   * Add new note
   */
  fastify.post('/', async (request, reply) => {
    /**
     * TODO: Validate request query
     */
    const { title, content } = request.query as AddNoteOptions;

    const addedNote = await noteService.addNote(title, content);

    return reply.send(addedNote);
  });
  done();
};

export default NoteRouter;
