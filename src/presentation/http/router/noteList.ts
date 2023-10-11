import type { FastifyPluginCallback } from 'fastify';
import type NoteListService from '@domain/service/noteList';
import type { Middlewares } from '@presentation/http/middlewares/index.js';
import type { NoteCreatorId } from '@domain/entities/note';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse';
import { StatusCodes } from 'http-status-codes';
import type { NoteList } from '@domain/entities/noteList';


interface GetNoteListById {
  /**
   * Note id
   */
  id: NoteCreatorId;
};

/**
 * Interface for the noteList router.
 */
interface NoteListRouterOptions {
  /**
   * Note service instance
   */
  noteListService: NoteListService,

  /**
   * Middlewares
   */
  middlewares: Middlewares,
};


/**
 * Note router plugin
 *
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const NoteListRouter: FastifyPluginCallback<NoteListRouterOptions> = (fastify, opts, done) => {

  const noteListService = opts.noteListService;

  /**
   * Get note by id
   */
  fastify.get<{ Params: GetNoteListById }>('/', { preHandler: [opts.middlewares.authRequired, opts.middlewares.withUser] }, async (request, reply) => {
    const userId = request.ctx.auth.id;

    const noteList = await noteListService.getNoteListByCreatorId(userId);

    /**
     * Check if noteList does not exist
     */
    if (!noteList) {
      const response: ErrorResponse = {
        code: StatusCodes.NOT_FOUND,
        message: 'Note not found Test Answer',
      };

      return reply.send(response);
    }

    const response: {data:NoteList} = {
      data: noteList,
    };

    return reply.send(response);
  });

  done();
};
export default NoteListRouter;
