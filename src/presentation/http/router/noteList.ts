import type { FastifyPluginCallback } from 'fastify';
import type NoteListService from '@domain/service/noteList.js';
import { definePublicNote, type NotePublic } from '@domain/entities/notePublic.js';
import type { NoteListPublic } from '@domain/entities/noteList';


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

      response: {
        '2xx': {
          type: 'object',
          properties: {
            queryString: {
              page: {
                type: 'object',
                minimum: 'number',
                maximum: 'number',
              },
            },
          },
          data: {
            $ref: 'NoteSchema',
          },
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.userId as number;
    const page = request.query.page;

    const noteList = await noteListService.getNoteListByCreatorId(userId, page);
    /**
     * Wrapping Notelist for public use
     */
    const noteListItemsPublic: NotePublic[] = noteList.items.map(definePublicNote);


    const noteListPublic: NoteListPublic = {
      items: noteListItemsPublic,
    };


    return reply.send(noteListPublic);
  });

  done();
};

export default NoteListRouter;
