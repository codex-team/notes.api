import type { FastifyPluginCallback } from 'fastify';
import type NoteListService from '@domain/service/noteList.js';
import type { NotePublic } from '@domain/entities/notePublic';
import type { NoteListPublic } from '@domain/entities/noteListPublic';
import type NoteSettingsPublic from '@domain/entities/noteSettingsPublic';

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
    /**
     * Wrapping Notelist for public use
     */
    const noteListItemsPublic: NotePublic[] = noteList.items.map((note) => {
      let settings: NoteSettingsPublic | null = null;

      if (request.noteSettings) {
        settings = {
          id: request.noteSettings.id,
          customHostname: request.noteSettings.customHostname,
          isPublic: request.noteSettings.isPublic,

        };
      }
      const notePublic: NotePublic = {
        id: note.publicId,
        content: note.content,
        creatorId: note.creatorId,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        noteSettings: settings,
      };

      return notePublic;
    });

    const noteListPublic: NoteListPublic = {
      items: noteListItemsPublic,
    };


    return reply.send(noteListPublic);
  });

  done();
};

export default NoteListRouter;
