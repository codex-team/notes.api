import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import { StatusCodes } from 'http-status-codes';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse.js';
import type { Note, NotePublicId } from '@domain/entities/note.js';
import useNoteResolver from '../middlewares/note/useNoteResolver.js';
import useNoteSettingsResolver from '../middlewares/noteSettings/useNoteSettingsResolver.js';

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
    Reply: Note | ErrorResponse,
  }>('/:notePublicId', {
    config: {
      policy: [
        'checkPermission',
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
      return fastify.notFound(reply, 'Note not found');
    }

    return reply.send(note);
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
      ],
    },
    preHandler: [
      noteResolver,
    ],
  }, async (request, reply) => {
    /**
     * @todo Check user access right
     */
    const noteId = request.note?.id as number;
    const { content } = request.body;

    const note = await noteService.updateNoteContentById(noteId, content);

    return reply.send({
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
    Reply: Note
  }>('/resolve-hostname/:hostname', async (request, reply) => {
    const params = request.params;

    const note = await noteService.getNoteByHostname(params.hostname);

    /**
     * Check if note does not exist
     */
    if (note === null) {
      return fastify.notFound(reply, 'Note not found');
    }

    return reply.send(note);
  });

  done();
};

export default NoteRouter;
