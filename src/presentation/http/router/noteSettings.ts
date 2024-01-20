import type { FastifyPluginCallback } from 'fastify';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import { isEmpty } from '@infrastructure/utils/empty.js';
import useNoteResolver from '../middlewares/note/useNoteResolver.js';
import type NoteService from '@domain/service/note.js';
import useNoteSettingsResolver from '../middlewares/noteSettings/useNoteSettingsResolver.js';
import type { NotePublicId } from '@domain/entities/note.js';
import type { Team, MemberRole } from '@domain/entities/team.js';
import type User from '@domain/entities/user.js';

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
   * Patch team member role by user and note id
   *
   * @todo add policy for this route to check id user have 'write' role if this team to patch someone's else role
   */
  fastify.patch<{
    Params: {
      notePublicId: NotePublicId,
      userId: User['id'],
      },
    Body: {
      newRole: MemberRole
      },
    Reply: MemberRole,
  }>('/:notePublicId/member/:userId', {
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
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;
    const newRole = await noteSettingsService.patchMemberRoleByUserId(request.params.userId, noteId, request.body.newRole);

    if (newRole === null) {
      return reply.notFound('User does not belong to Note\'s team');
    }

    return reply.send(newRole);
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
   *
   * @todo add policy for this route (check if user is collaborator)
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

  done();
};

export default NoteSettingsRouter;
