import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse.js';
import type { Note, NotePublicId } from '@domain/entities/note.js';
import useNoteResolver from '../middlewares/note/useNoteResolver.js';
import useNoteSettingsResolver from '../middlewares/noteSettings/useNoteSettingsResolver.js';
import { StatusCodes } from 'http-status-codes';

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
   * Get note by id
   */
  fastify.get<{
    Params: {
      notePublicId: NotePublicId;
    },
    Reply: {
      note : Note
      accessRights: { canEdit: boolean },
    } | ErrorResponse,
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
    const { note } = request;

    /**
     * Check if note does not exist
     */
    if (note === null) {
      return reply.notFound('Note not found');
    }

    /**
     * Check if current user is creator of the note
     */
    const canEdit = note.creatorId === request.userId;

    return reply
      .status(StatusCodes.OK).send({
        note: note,
        accessRights: { canEdit: canEdit },
    });
  });

  /**
   * Deletes note by id
   */
  fastify.delete<{
    Params: {
      notePublicId : NotePublicId;
    },
    Reply: {
      isDeleted : boolean
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
        'userInTeam',
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
    return reply
      .status(StatusCodes.OK)
      .send({ isDeleted : isDeleted });
  });

  /**
   * Adds a new note.
   * Responses with note public id.
   */
  fastify.post<{
    Body: {
      content: JSON;
    },
    Reply: {
      id: NotePublicId
    },
  }>('/', {
    config: {
      policy: [
        'authRequired',
      ],
    },
  }, async (request, reply) => {
    /**
     * TODO: Validate request query
     */
    const { content } = request.body;
    const { userId } = request;

    const addedNote = await noteService.addNote(content, userId as number); // "authRequired" policy ensures that userId is not null

    /**
     * @todo use event bus: emit 'note-added' event and subscribe to it in other modules like 'note-settings'
     */
    await noteSettingsService.addNoteSettings(addedNote.id);

    return reply
      .status(StatusCodes.OK)
      .send({
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
        'userInTeam',
      ],
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.note?.id as number;
    const { content } = request.body;

    const note = await noteService.updateNoteContentById(noteId, content);

    return reply
      .status(StatusCodes.OK).send({
        updatedAt: note.updatedAt,
      });
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
      note : Note
      accessRights: { canEdit: boolean },
    } | ErrorResponse,
  }>('/resolve-hostname/:hostname', { 
    schema: {
      params: {
        hostname:{
          $ref: 'NoteSchema#/properties/id'
        }
      }
  }}, async (request, reply) => {
    const params = request.params;

    const note = await noteService.getNoteByHostname(params.hostname);

    /**
     * Check if note does not exist
     */
    if (note === null) {
      return reply.notFound('Note not found');
    }

    /**
     * Check if current user is creator of the note
     */
    const canEdit = note.creatorId === request.userId;

    return reply.status(StatusCodes.OK)
      .send({
        note: note,
        accessRights: { canEdit: canEdit },
      });
  });

  done();
};

export default NoteRouter;
