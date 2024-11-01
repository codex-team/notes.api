import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import useNoteResolver from '../middlewares/note/useNoteResolver.js';
import useNoteSettingsResolver from '../middlewares/noteSettings/useNoteSettingsResolver.js';
import useMemberRoleResolver from '../middlewares/noteSettings/useMemberRoleResolver.js';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import { definePublicNote, type NotePublic } from '@domain/entities/notePublic.js';
import type { NoteListPublic } from '@domain/entities/noteList.js';
import { NoteInternalId } from '@domain/entities/note.js';

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
   * Prepare note id resolver middleware
   * It should be used in routes that accepts note public id
   */
  const { noteResolver } = useNoteResolver(noteService);

  /**
   * Prepare note settings resolver middleware
   * It should be used to use note settings in middlewares
   */
  const { noteSettingsResolver } = useNoteSettingsResolver(noteSettingsService);

  /**
   * Prepare user role resolver middleware
   * It should be used to use user role in middlewares
   */
  const { memberRoleResolver } = useMemberRoleResolver(noteSettingsService);

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
    }
    Querystring: {
      page: number;
    };
  }>('/:parentNoteId', {
    config: {
      policy: [
        'notePublicOrUserInTeam',
      ],
    },
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      }, querystring: {
        page: {
          type: 'number',
          minimum: 1,
          maximum: 30,
        },
      }, response: {
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
    }, preHandler: [
      noteResolver,
      noteSettingsResolver,
      memberRoleResolver,
    ],
  }, async (request, reply) => {
    const { parentNoteId } = await request.params;
    const { page } = await request.query;

    const noteList = await noteService.getNoteListByParentNote(parentNoteId, page);
    /**
     * Wrapping Notelist for public use
     */
    const noteListItemsPublic: NotePublic[] = noteList.items.map(definePublicNote);

    const noteListPublic: NoteListPublic = {
      items: noteListItemsPublic,
    };

    return reply.send(noteListPublic);
  })


  done();
};

export default NoteListRouter;
