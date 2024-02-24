import type { FastifyPluginCallback } from 'fastify';
import type NoteListService from '@domain/service/noteList.js';
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
   * Get note list for one page by userId
   */
  fastify.get<{
    Querystring: {
      page: number;
    },
  }>('/', {
    config: {
      policy: [
        'authRequired',
      ],
    },
    schema: {
      querystring: {
        page: {
          type: 'number',
          minimum: 1,
          maximum: 30,
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.userId as number;
    const page = request.query.page;

    const noteList = await noteListService.getNoteListByCreatorId(userId, page);

    return reply
      .status(StatusCodes.OK)
      .send(noteList);
  });

  done();
};

export default NoteListRouter;
