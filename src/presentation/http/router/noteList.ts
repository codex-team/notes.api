import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import { definePublicNote, type NotePublic } from '@domain/entities/notePublic.js';
import type { NoteListPublic } from '@domain/entities/noteList.js';
import type { NoteInternalId } from '@domain/entities/note.js';

/**
 * Interface for the noteList router.
 */
interface NoteListRouterOptions {
  /**
   * Note service instance
   */
  noteService: NoteService;

  /**
   * Note Settings service instance
   */
  noteSettingsService: NoteSettingsService;

}

/**
 * Note list router plugin
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const NoteListRouter: FastifyPluginCallback<NoteListRouterOptions> = (fastify, opts, done) => {
  const noteService = opts.noteService;
  const noteSettingsService = opts.noteSettingsService;

  /**
   * Get note list ordered by time of last visit
   */
  fastify.get<{
    Querystring: {
      page: number;
    };
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
          description: 'Query notelist',
          properties: {
            items: {
              id: { type: 'string' },
              content: { type: 'string' },
              createdAt: { type: 'string' },
              creatorId: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
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

  /**
   * Get note list by parent note
   */
  fastify.get<{
    Params: {
      parentNoteId: NoteInternalId;
    };
    Querystring: {
      page: number;
    };
  }>('/:parentNoteId', {
    config: {
      policy: [
        'authRequired',
      ],
    },
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
      querystring: {
        page: {
          type: 'number',
          minimum: 1,
          maximum: 30,
        },
      },
      response: {
        '2xx': {
          description: 'Query notelist',
          properties: {
            items: {
              type: 'array',
              items: { $ref: 'NoteSchema#' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { parentNoteId } = request.params;
    const userId = request.userId as number;
    const { page } = request.query;

    /**
     * Fetching note settings from noteSetting service
     */
    const noteSettings = await noteSettingsService.getNoteSettingsByNoteId(parentNoteId);

    if (!noteSettings.isPublic) {
      const isTeamMember = noteSettings.team?.find(team => team.userId === userId);

      /**
       * Checks if the user is a member of the team
       */
      if (!isTeamMember) {
        return reply.forbidden();
      }
    }
    const noteList = await noteService.getNoteListByParentNote(parentNoteId, page);
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
