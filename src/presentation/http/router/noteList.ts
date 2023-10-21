import type { FastifyPluginCallback } from 'fastify';
import type NoteListService from '@domain/service/noteList';
import type { Middlewares } from '@presentation/http/middlewares/index.js';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Interface for the noteList router.
 */
interface NoteListRouterOptions {
  /**
   * Note list service instance
   */
  noteListService: NoteListService,

  /**
   * Middlewares
   */
  middlewares: Middlewares,
};


/**
 * Note list router plugin
 *
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const NoteListRouter: FastifyPluginCallback<NoteListRouterOptions> = (fastify, opts, done) => {

  const noteListService = opts.noteListService;

  /**
   * Get note list by userId
   */
  fastify.get('/', { preHandler: [opts.middlewares.authRequired, opts.middlewares.withUser] }, async (request, reply) => {
    const userId = request.ctx.auth.id;

    const noteList = await noteListService.getNoteListByCreatorId(userId);

    /**
     * Check if note list does not exist
     */
    if (!noteList) {
      const response: ErrorResponse = {
        code: StatusCodes.NOT_FOUND,
        message: 'Note list not found',
      };

      return reply.send(response);
    }

    return reply.send(noteList);
  });

  done();
};
export default NoteListRouter;
