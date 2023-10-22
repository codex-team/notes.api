import type { FastifyPluginCallback } from 'fastify';
import type NoteListService from '@domain/service/noteList.js';

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
  fastify.get<{
    Querystring: {
      offset: number,
      limit: number,
    },
  }>('/', {
    config: {
      policy: [
        'authRequired',
      ],
    },
    schema: {
      querystring: {
        offset: {
          type: 'number',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 30,
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.userId as number;
    const offset = request.query.offset;

    /**
     * if limit > 30 or limit < 1 error throws (in scedule)
     */
    const limit = request.query.limit;
    const noteList = await noteListService.getNoteListByCreatorId(userId, offset, limit);

    return reply.send(noteList);
  });

  done();
};

export default NoteListRouter;
