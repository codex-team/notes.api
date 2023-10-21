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
  fastify.get('/', {
    config: {
      policy: [
        'authRequired',
      ],
    },
  }, async (request, reply) => {
    const { userId } = request;
    const noteList = await noteListService.getNoteListByCreatorId(userId as number);

    return reply.send(noteList);
  });

  done();
};
export default NoteListRouter;
