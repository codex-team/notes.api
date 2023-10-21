import type { FastifyPluginCallback } from 'fastify';
import type NoteListService from '@domain/service/noteList.js';
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

}

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
  fastify.get('/', {
    config: {
      policy: [
        'authRequired',
      ],
    },
  }, async (request, reply) => {
    const { userId } = request;
    const noteList = await noteListService.getNoteListByCreatorId(userId as number);

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
