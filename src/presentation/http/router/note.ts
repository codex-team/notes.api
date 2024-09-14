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
import type NoteVisitsService from '@domain/service/noteVisits.js';
import type EditorToolsService from '@domain/service/editorTools.js';
import type EditorTool from '@domain/entities/editorTools.js';
import type { NoteHistoryMeta, NoteHistoryPublic, NoteHistoryRecord } from '@domain/entities/noteHistory.js';
import { NoteList } from '@domain/entities/noteList.js';

/**
 * Interface for the note router.
 */
interface NoteRouterOptions {
  /**
   * Note service instance
   */
  noteService: NoteService;

  /**
   * Note Settings service instance
   */
  noteSettingsService: NoteSettingsService;

  /**
   * Note visits service instance
   */
  noteVisitsService: NoteVisitsService;

  /**
   * Editor tools service instance
   */
  editorToolsService: EditorToolsService;
}

/**
 * Note router plugin
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
  const noteVisitsService = opts.noteVisitsService;
  const editorToolsService = opts.editorToolsService;

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
    };
    Reply: {
      note: NotePublic;
      parentNote?: NotePublic | undefined;
      accessRights: {
        canEdit: boolean;
      };
      tools: EditorTool[];
      parents: NoteList;
    } | ErrorResponse;
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
          description: 'Fetch all information of the notePublicId passed',
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
            tools: {
              type: 'array',
              items: {
                $ref: 'EditorToolSchema',
              },
            },
            parents: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    $ref: 'NoteSchema',
                  },
                },
              },
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
     * @todo use event bus to save note visits
     */
    if (userId !== null) {
      await noteVisitsService.saveVisit(noteId, userId);
    }

    const parentId = await noteService.getParentNoteIdByNoteId(note.id);
    const parentNote = parentId !== null ? definePublicNote(await noteService.getNoteById(parentId)) : undefined;

    /**
     * Wrap note for public use
     */
    const notePublic = definePublicNote(note);

    /**
     * Get all tools used in the note
     */
    const noteToolsIds: EditorTool['id'][] = note.tools.map(tool => tool.id);

    const noteTools = await editorToolsService.getToolsByIds(noteToolsIds);
    /**
     * Check if current user can edit the note
     */
    const canEdit = memberRole === MemberRole.Write;

    const noteParentStructure = await noteService.getNoteParentStructure(noteId, userId!);

    return reply.send({
      note: notePublic,
      parentNote: parentNote,
      accessRights: { canEdit: canEdit },
      tools: noteTools,
      parents: noteParentStructure,
    });
  });

  /**
   * Deletes note by id
   */
  fastify.delete<{
    Params: {
      notePublicId: NotePublicId;
    };
    Reply: {
      isDeleted: boolean;
    };
  }>('/:notePublicId', {
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
    const isDeleted = await noteService.deleteNoteById(noteId);

    /**
     * Check if note does not exist
     */
    return reply.send({ isDeleted: isDeleted });
  });

  /**
   * Adds a new note.
   * Responses with note public id.
   */
  fastify.post<{
    Body: {
      content: JSON;
      parentId?: NotePublicId;
      tools: Note['tools'];
    };
    Reply: {
      id: NotePublicId;
    };
  }>('/', {
    config: {
      policy: [
        'authRequired',
      ],
    },
    schema: {
      body: {
        content: {
          $ref: 'NoteSchema#/properties/content',
        },
        parentId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
      response: {
        '2xx': {
          description: 'Note fields response',
          content: {
            'application/json': {
              schema: {
                id: {
                  $ref: 'NoteSchema#/properties/id',
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    /**
     * @todo Validate request query
     */
    const content = request.body.content !== undefined ? request.body.content : {};
    const { userId } = request;
    const parentId = request.body.parentId;
    const noteTools = request.body.tools;

    await noteService.validateNoteTools(noteTools, content);

    const addedNote = await noteService.addNote(content as Note['content'], userId as number, parentId, noteTools); // "authRequired" policy ensures that userId is not null

    /**
     * Save note visit when note created
     * @todo use even bus to save noteVisit
     */

    await noteVisitsService.saveVisit(addedNote.id, userId!);

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
      notePublicId: NotePublicId;
    };
    Body: {
      content: Note['content'];
      tools: Note['tools'];
    };
    Reply: {
      updatedAt: Note['updatedAt'];
    };
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
        content: {
          type: 'object',
        },
      },

      response: {
        '2xx': {
          description: 'Updated timestamp',
          properties: {
            updatedAt: {
              type: 'string',
            },
          },
        },
      },
    },
    preHandler: [
      noteResolver,
      noteSettingsResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;
    const content = request.body.content;
    const noteTools = request.body.tools;
    const { userId } = request;

    await noteService.validateNoteTools(noteTools, content);

    const note = await noteService.updateNoteContentAndToolsById(noteId, content, noteTools, userId!);

    return reply.send({
      updatedAt: note.updatedAt,
    });
  });

  /**
   * Create note relation by id.
   */
  fastify.post<{
    Params: {
      notePublicId: NotePublicId;
    };
    Body: {
      parentNoteId: NotePublicId;
    };
    Reply: {
      parentNote: Note;
    };
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
            parentNote: {
              $ref: 'NoteSchema#',
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

    const parentNote = await noteService.createNoteRelation(noteId, parentNoteId);

    return reply.send({ parentNote });
  });

  /**
   * Update note relation by id.
   */
  fastify.patch<{
    Params: {
      notePublicId: NotePublicId;
    };
    Body: {
      parentNoteId: NotePublicId;
    };
    Reply: {
      isUpdated: boolean;
    };
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
          description: 'Updated note',
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

    const isUpdated = await noteService.updateNoteRelation(noteId, parentNoteId);

    return reply.send({ isUpdated });
  });

  /**
   * Delete parent relation
   */
  fastify.delete<{
    Params: {
      notePublicId: NotePublicId;
    };
    Reply: {
      isDeleted: boolean;
    };
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
     * Delete all visits of the note
     * @todo use event bus to delete note visits
     */
    await noteVisitsService.deleteNoteVisits(noteId);

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
    };
    Reply: {
      note: NotePublic;
      accessRights: {
        canEdit: boolean;
      };
      tools: EditorTool[];
    } | ErrorResponse;
  }>('/resolve-hostname/:hostname', {
    schema: {
      params: {
        hostname: {
          type: 'string',
        },
      },
      response: {
        '2xx': {
          type: 'object',
          description: 'Custom hostname response',
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
            tools: {
              type: 'array',
              items: {
                $ref: 'EditorToolSchema',
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

    /**
     * Check if note exists
     */
    if (note === null) {
      return reply.notFound('Note not found');
    }

    /**
     * Save note visit if user is authorized
     * @todo use event bus to save note visits
     */
    if (userId !== null) {
      await noteVisitsService.saveVisit(note.id, userId);
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

    /**
     * Get all tools used in the note
     */
    const noteToolsIds: EditorTool['id'][] = note.tools.map(tool => tool.id);

    const noteTools = await editorToolsService.getToolsByIds(noteToolsIds);

    return reply.send({
      note: notePublic,
      accessRights: { canEdit: canEdit },
      tools: noteTools,
    });
  });

  /**
   * Get note history preview
   */
  fastify.get<{
    Params: {
      notePublicId: NotePublicId;
    };
    Reply: {
      noteHistoryMeta: NoteHistoryMeta[];
    } | ErrorResponse;
  }>('/:notePublicId/history', {
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
          properties: {
            noteHistoryMeta: {
              type: 'array',
              items: {
                $ref: 'HistoryMetaSchema',
              },
            },
          },
        },
      },
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const { note } = request;
    const noteId = request.note?.id as number;

    if (note === null) {
      return reply.notAcceptable('Note not found');
    }

    return reply.send({
      noteHistoryMeta: await noteService.getNoteHistoryByNoteId(noteId),
    });
  });

  /**
   * Get note history record
   */
  fastify.get<{
    Params: {
      notePublicId: NotePublicId;
      historyId: NoteHistoryRecord['id'];
    };
    Reply: {
      noteHistoryRecord: NoteHistoryPublic;
    } | ErrorResponse;
  }>('/:notePublicId/history/:historyId', {
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
        historyId: {
          $ref: 'NoteHistorySchema#/properties/id',
        },
      },
      response: {
        '2xx': {
          type: 'object',
          properties: {
            noteHistoryRecord: {
              $ref: 'NoteHistorySchema#',
            },
          },
        },
      },
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const { note } = request;
    const historyId = request.params.historyId;

    /**
     * Check if note exists
     */
    if (note === null) {
      return reply.notAcceptable('Note not found');
    }

    const historyRecord = await noteService.getHistoryRecordById(historyId);

    return reply.send({
      noteHistoryRecord: historyRecord,
    });
  });

  done();
};

export default NoteRouter;
