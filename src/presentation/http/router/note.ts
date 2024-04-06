import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse.js';
import type { Note, NotePublicId } from '@domain/entities/note.js';
import useNoteResolver from '../middlewares/note/useNoteResolver.js';
import useNoteSettingsResolver from '../middlewares/noteSettings/useNoteSettingsResolver.js';
import useMemberRoleResolver from '../middlewares/noteSettings/useMemberRoleResolver.js';
import { MemberRole } from '@domain/entities/team.js';
import { type NotePublic, definePublicNote } from '@domain/entities/notePublic.js';

/**
 * Interface for the note router.
 */
interface NoteRouterOptions {
  /**
   * Note service instance
   */
  noteService: NoteService,

  /**
   * Note Settings service instance
   */
  noteSettingsService: NoteSettingsService,
}

/**
 * Note router plugin
 *
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const NoteRouter: FastifyPluginCallback<NoteRouterOptions> = (fastify, opts, done) => {
  /**
   * Get note service from options
   */
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
   * Get note by id
   */
  fastify.get<{
    Params: {
      notePublicId: NotePublicId;
    },
    Reply: {
      note: NotePublic,
      parentNote?: NotePublic | undefined,
      accessRights: {
        canEdit: boolean,
      },
    }| ErrorResponse,
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
      response: {
        '2xx': {
          type: 'object',
          properties: {
            note: {
              $ref: 'NoteSchema',
            },
            accessRights: {
              type: 'object',
              properties: {
                canEdit: {
                  type: 'boolean',
                },
              },
            },
            parentNote: {
              $ref: 'NoteSchema',
            },
          },
        },
      },
    },
    preHandler: [
      noteResolver,
      noteSettingsResolver,
      memberRoleResolver,
    ],
  }, async (request, reply) => {
    const { note } = request;
    const noteId = request.note?.id as number;
    const { memberRole } = request;
    const { userId } = request;

    /**
     * Check if note exists
     */
    if (note === null) {
      return reply.notFound('Note not found');
    }

    /**
     * Check if user is authorized
     */
    if (userId !== null) {
      await noteService.saveVisit(noteId, userId);
    }

    const parentId = await noteService.getParentNoteIdByNoteId(note.id);

    const parentNote = parentId !== null ? definePublicNote(await noteService.getNoteById(parentId)) : undefined;
    /**
     * Wrap note for public use
     */
    const notePublic = definePublicNote(note);

    /**
     * Check if current user can edit the note
     */
    const canEdit = memberRole === MemberRole.Write;


    return reply.send({
      note: notePublic,
      parentNote: parentNote,
      accessRights: { canEdit: canEdit },
    });
  });

  /**
   * Deletes note by id
   */
  fastify.delete<{
    Params: {
      notePublicId: NotePublicId;
    },
    Reply: {
      isDeleted: boolean
    },
  }>('/:notePublicId', {
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
    },
    config: {
      policy: [
        'authRequired',
        'userCanEdit',
      ],
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;
    const isDeleted = await noteService.deleteNoteById(noteId);

    /**
     * Delete all visits of the note
     */
    await noteService.deleteNoteVisits(noteId);

    /**
     * Check if note does not exist
     */
    return reply.send({ isDeleted : isDeleted });
  });

  /**
   * Adds a new note.
   * Responses with note public id.
   */
  fastify.post<{
    Body: {
      content: JSON;
      parentId?: NotePublicId;
    },
    Reply: {
      id: NotePublicId,
    },
  }>('/', {
    config: {
      policy: [
        'authRequired',
      ],
    },
  }, async (request, reply) => {
    /**
     * @todo Validate request query
     */
    const content = request.body.content !== undefined ? request.body.content : {};
    const { userId } = request;
    const parentId = request.body.parentId;

    const addedNote = await noteService.addNote(content as JSON, userId as number, parentId); // "authRequired" policy ensures that userId is not null

    /**
     * Check if user is authorized
     */
    if (userId !== null) {
      await noteService.saveVisit(addedNote.id, userId);
    }

    /**
     * @todo use event bus: emit 'note-added' event and subscribe to it in other modules like 'note-settings'
     */
    await noteSettingsService.addNoteSettings(addedNote.id);

    /**
     * Creates TeamMember with write priveleges
     */
    await noteSettingsService.createTeamMember({
      noteId: addedNote.id,
      userId: userId as number,
      role: MemberRole.Write,
    });

    return reply.send({
      id: addedNote.publicId,
    });
  });

  /**
   * Updates note by id.
   */
  fastify.patch<{
    Params: {
      notePublicId: NotePublicId,
    },
    Body: {
      content: JSON;
    },
    Reply: {
      updatedAt: Note['updatedAt'],
    }
  }>('/:notePublicId', {
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
      body: {
        content: {
          $ref: 'NoteSchema#/properties/content',
        },
      },
    },
    config: {
      policy: [
        'authRequired',
        'userCanEdit',
      ],
    },
    preHandler: [
      noteResolver,
      noteSettingsResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;
    const content = request.body.content as JSON;

    const note = await noteService.updateNoteContentById(noteId, content);

    return reply.send({
      updatedAt: note.updatedAt,
    });
  });

  /**
   * Update note relation by id.
   */
  fastify.patch<{
    Params: {
      notePublicId: NotePublicId,
    },
    Body: {
      parentNoteId: NotePublicId,
    },
    Reply: {
      isUpdated: boolean,
    }
  }>('/:notePublicId/relation', {
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
      body: {
        parentNoteId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
      response: {
        '2xx': {
          type: 'object',
          properties: {
            isUpdated: {
              type: 'boolean',
            },
          },
        },
      },
    },
    config: {
      policy: [
        'authRequired',
        'userCanEdit',
      ],
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;
    const parentNoteId = request.body.parentNoteId;

    const isUpdated =  await noteService.updateNoteRelation(noteId, parentNoteId);

    return reply.send({ isUpdated });
  });

  /**
   * Delete parent relation
   */
  fastify.delete<{
    Params: {
      notePublicId: NotePublicId,
    },
    Reply: {
      isDeleted: boolean,
    }
  }>('/:notePublicId/relation', {
    schema: {
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
      response: {
        '2xx': {
          type: 'object',
          properties: {
            isDeleted: {
              type: 'boolean',
            },
          },
        },
      },
    },
    config: {
      policy: [
        'authRequired',
        'userCanEdit',
      ],
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;

    const isDeleted = await noteService.unlinkParent(noteId);

    /**
     * Check if parent relation was successfully deleted
     */
    if (!isDeleted) {
      return reply.notAcceptable('Parent note does not exist');
    }

    return reply.send({ isDeleted });
  });

  /**
   * Get note by custom hostname
   */
  fastify.get<{
    Params: {
      /**
       * Custom Hostname to search note by
       */
      hostname: string;
    },
    Reply: {
      note: NotePublic,
      accessRights: {
        canEdit: boolean,
      },
    }| ErrorResponse,
  }>('/resolve-hostname/:hostname', {
    schema: {
      response: {
        '2xx': {
          type: 'object',
          properties: {
            note: {
              $ref: 'NoteSchema',
            },
            accessRights: {
              type: 'object',
              properties: {
                canEdit: {
                  type: 'boolean',
                },
              },
            },
          },

        },
      },
    },
  }, async (request, reply) => {
    const params = request.params;
    const { userId } = request;
    const note = await noteService.getNoteByHostname(params.hostname);
    const noteId = note?.id as number;

    /**
     * Check if note exists
     */
    if (note === null) {
      return reply.notFound('Note not found');
    }

    /**
     * Save note visit if user is authorized
     */
    if (userId !== null) {
      await noteService.saveVisit(noteId, userId);
    }

    /**
     * By default, unauthorized user can not edit the note
     */
    let canEdit = false;

    /**
     * Wrapping Note for public use
     */
    const notePublic = definePublicNote(note);

    /**
     *  Check if current user is logged in and can edit the note
     */
    if (request.userId !== null) {
      const memberRole = await noteSettingsService.getUserRoleByUserIdAndNoteId(request.userId, note.id);

      /**
       * Check if current user can edit the note
       */
      canEdit = memberRole === MemberRole.Write;
    }

    return reply.send({
      note: notePublic,
      accessRights: { canEdit: canEdit },
    });
  });

  done();
};

export default NoteRouter;
