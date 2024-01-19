import type { FastifyPluginCallback } from 'fastify';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import type { InvitationHash } from '@domain/entities/noteSettings.js';
import { isEmpty } from '@infrastructure/utils/empty.js';
import useNoteResolver from '../middlewares/note/useNoteResolver.js';
import type NoteService from '@domain/service/note.js';
import useNoteSettingsResolver from '../middlewares/noteSettings/useNoteSettingsResolver.js';
import type { NotePublicId } from '@domain/entities/note.js';
import type { Team } from '@domain/entities/team.js';

/**
 * Interface for the note settings router.
 */
interface NoteSettingsRouterOptions {
  /**
   * Note Settings service instance
   */
  noteSettingsService: NoteSettingsService;

  /**
   * Note service instance
   */
  noteService: NoteService;
}

/**
 * Note Settings router plugin
 *
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const NoteSettingsRouter: FastifyPluginCallback<NoteSettingsRouterOptions> = (fastify, opts, done) => {
  /**
   * Get domain services from options
   */
  const noteSettingsService = opts.noteSettingsService;
  const noteService = opts.noteService;

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
   * Returns Note settings by note id. Note public id is passed in route params, and it converted to internal id via middleware
   */
  fastify.get<{
    Params: {
      notePublicId: NotePublicId;
    },
    Reply: NoteSettings
  }>('/:notePublicId', {
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
      },
    },
    preHandler: [
      noteResolver,
      noteSettingsResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;

    const noteSettings = await noteSettingsService.getNoteSettingsByNoteId(noteId);

    /**
     * Check if note does not exist
     */
    if (isEmpty(noteSettings)) {
      return reply.notFound('Note settings not found');
    }

    return reply.send(noteSettings);
  });

  /**
   * Patch noteSettings by note id
   */
  fastify.patch<{
    Body: Partial<NoteSettings>,
    Params: {
      notePublicId: NotePublicId;
    },
    Reply: NoteSettings,
  }>('/:notePublicId', {
    config: {
      policy: [
        'authRequired',
        'userInTeam',
      ],
    },
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;

    /**
     * @todo validate data
     */
    const { customHostname, isPublic } = request.body;

    /**
     * TODO: check is user collaborator
     */

    const updatedNoteSettings = await noteSettingsService.patchNoteSettingsByNoteId(noteId, {
      customHostname,
      isPublic,
    });

    if (updatedNoteSettings === null) {
      return reply.notFound('Note settings not found');
    }

    return reply.send(updatedNoteSettings);
  });

  /**
   * Get team by note id
   * TODO add policy for this route (check if user is collaborator)
   */
  fastify.get<{
    Params: {
      notePublicId: NotePublicId,
    },
    Reply: Team,
  }>('/:notePublicId/team', {
    config: {
      policy: [
        'authRequired',
        'userInTeam',
      ],
    },
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;

    const team = await noteSettingsService.getTeamByNoteId(noteId);

    return reply.send(team);
  });

  /**
   * Generates a new invitation hash for a specific note
   * TODO add policy for this route (check if user's role is write)
   */
  fastify.patch<{
    Params: {
      notePublicId: NotePublicId;
    },
    Reply: {
      invitationHash: InvitationHash;
    },
  }>('/:notePublicId/invitation-hash', {
    config: {
      policy: [
        'authRequired',
        'userInTeam',
      ],
    },
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
      response: {
        '2xx': {
          type: 'object',
          description: 'New invitation hash',
          properties: {
            invitationHash: {
              $ref: 'NoteSettingsSchema#/properties/invitationHash',
            },
          },
        },
      },
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;

    const updatedNoteSettings = await noteSettingsService.regenerateInvitationHash(noteId);

    return reply.send({
      invitationHash: updatedNoteSettings.invitationHash,
    });
  });

  done();
};

export default NoteSettingsRouter;
