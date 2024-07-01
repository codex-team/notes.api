import type { FastifyPluginCallback } from 'fastify';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import { definePublicNoteSettings } from '@domain/entities/noteSettings.js';
import type { InvitationHash, NoteSettingsPublic } from '@domain/entities/noteSettings.js';
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
    };
    Reply: NoteSettingsPublic;
  }>('/:notePublicId', {
    config: {
      policy: [
        'authRequired',
        'userCanEdit',
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
          $ref: 'NoteSettingsSchema',
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

    const noteSettingsPublic = definePublicNoteSettings(noteSettings);

    return reply.send(noteSettingsPublic);
  });

  /**
   * Patch team member role by user and note id
   */
  fastify.patch<{
    Params: {
      notePublicId: NotePublicId;
    };
    Body: {
      userId: User['id'];
      newRole: MemberRole;
    };
    Reply: MemberRole;
  }>('/:notePublicId/team', {
    config: {
      policy: [
        'authRequired',
        'userCanEdit',
      ],
    },
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
      body: {
        properties: {
          userId: {
            $ref: 'UserSchema#/properties/id',
          },
          newRole: {
            $ref: 'NoteSettingsSchema#/properties/team/items/properties/role',
          },
        },
      },

      response: {
        '2xx': {
          type: 'number',
          properties: {
            newRole: {
              type: 'number',
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

    if (request.note?.creatorId === request.body.userId) {
      return reply.forbidden('You can\'t patch creator\'s role');
    }

    const newRole = await noteSettingsService.patchMemberRoleByUserId(request.body.userId, noteId, request.body.newRole);

    if (newRole === undefined) {
      return reply.notFound('User does not belong to Note\'s team');
    }

    return reply.send(newRole);
  });

  /**
   * Deletes user from the noteTeam
   */
  fastify.delete<{
    Params: {
      notePublicId: NotePublicId;
    };
    Body: {
      userId: User['id'];
    };
    Reply: User['id'];
  }>('/:notePublicId/team', {
    config: {
      policy: [
        'authRequired',
        'userCanEdit',
      ],
    },
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
      body: {
        userId: {
          $ref: 'UserSchema#/properties/id',
        },
      },
      response: {
        '2xx': {
          $ref: 'UserSchema#/properties/id',
        },
      },
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;
    const userId = request.body.userId;

    if (request.note?.creatorId === request.body.userId) {
      return reply.forbidden('You can\'t remove note\'s creator from the team');
    }

    const deletedTeamMemberId = await noteSettingsService.removeTeamMemberByUserIdAndNoteId(userId, noteId);

    if (deletedTeamMemberId === undefined) {
      return reply.notFound('User does not belong to Note\'s team');
    }

    return reply.send(deletedTeamMemberId);
  });

  /**
   * Patch noteSettings by note id
   */
  fastify.patch<{
    Body: Pick<NoteSettings, 'customHostname' | 'isPublic' | 'cover'>;
    Params: {
      notePublicId: NotePublicId;
    };
    Reply: NoteSettingsPublic;
  }>('/:notePublicId', {
    config: {
      policy: [
        'authRequired',
        'userCanEdit',
      ],
    },
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
      body: {
        properties: {
          customHostname: {
            type: 'string',
          },

          isPublic: {
            type: 'boolean',
          },
          cover: {
            type: 'string'
          }
        },
      },
      response: {
        '2xx': {
          $ref: 'NoteSettingsSchema',
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
    const { customHostname, isPublic, cover } = request.body;

    const updatedNoteSettings = await noteSettingsService.patchNoteSettingsByNoteId(noteId, {
      customHostname,
      isPublic,
      cover,
    });

    if (updatedNoteSettings === null) {
      return reply.notFound('Note settings not found');
    }

    const noteSettingsPublic = definePublicNoteSettings(updatedNoteSettings);

    return reply.send(noteSettingsPublic);
  });

  /**
   * Get team by note id
   */
  fastify.get<{
    Params: {
      notePublicId: NotePublicId;
    };
    Reply: Team;
  }>('/:notePublicId/team', {
    config: {
      policy: [
        'authRequired',
        'userCanEdit',
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
          type: 'array',
          description: 'Fetch all teams associated with the notePublicId',
          properties: {
            id: { type: 'string' },
            noteId: { type: 'string' },
            role: { type: 'string' },
            userId: { type: 'string' },
          },
        },
      },
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;

    const team = await noteSettingsService.getInheritedTeamByNoteId(noteId);

    return reply.send(team);
  });

  /**
   * Generates a new invitation hash for a specific note
   */
  fastify.patch<{
    Params: {
      notePublicId: NotePublicId;
    };
    Reply: {
      invitationHash: InvitationHash;
    };
  }>('/:notePublicId/invitation-hash', {
    config: {
      policy: [
        'authRequired',
        'userCanEdit',
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
