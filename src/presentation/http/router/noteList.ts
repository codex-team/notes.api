import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import { definePublicNote, type NotePublic } from '@domain/entities/notePublic.js';
import type { NoteListPublic } from '@domain/entities/noteList.js';

/**
 * Interface for the noteList router.
 */
interface NoteListRouterOptions {
  /**
   * Note list service instance
   */
  noteService: NoteService,

}

/**
 * Note list router plugin
 *
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const NoteListRouter: FastifyPluginCallback<NoteListRouterOptions> = (fastify, opts, done) => {
  const noteService = opts.noteService;

  /**
   * Get note list ordered by time of last visit
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

    const noteList = await noteService.getNoteListByUserId(userId, page);
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