import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import { StatusCodes } from 'http-status-codes';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse.js';
import type { Note, NotePublicId } from '@domain/entities/note.js';
import { NoteSchema, NoteOptionsShema } from '../schema/Note.js';

/**
 * Get note by id options
 */
interface GetNoteByIdOptions {
  /**
   * Note id
   */
  id: NotePublicId;
}

/**
 * Add note options
 */
interface AddNoteOptions {
  /**
   * Note content
   */
  content: JSON;
}

/**
 * Payload for update note request
 */
interface UpdateNoteOptions {
  /**
   * Note public id
   */
  id: NotePublicId;

  /**
   * New content
   */
  content: JSON;
}


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

interface ResolveHostnameOptions {
  /**
   * Custom Hostname
   */
  hostname: string;
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
   * Get note by id with shema JSON (validate request params)
   */
  fastify.get<{
    Params: GetNoteByIdOptions,
    Reply: Note | ErrorResponse
  }>('/:id', {
    preHandler: opts.middlewares.withUser,
    schema: {
      params: NoteSchema,
    },
  }, async (request, reply) => {
    const params = request.params;

    const { id } = params;

    const note = await noteService.getNoteById(id);

    /**
     * Check if note does not exist
     */
    if (note === null) {
      return fastify.notFound(reply, 'Note not found');
    }

    const noteSettings = await noteSettingsService.getNoteSettingsByNoteId(note.id);

    if (noteSettings?.enabled === true) {
      return reply.send(note);
    }

    return reply
      .code(StatusCodes.UNAUTHORIZED)
      .send({
        message: 'Permission denied',
      });
  });

  /**
   * Adds a new note.
   * Responses with note public id.
   */
  fastify.post<{
    Body: AddNoteOptions,
    Reply: { id: NotePublicId },
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

    /**
     * Get user id from request context, because we have auth middleware
     */
    const user = request.ctx.auth.id;

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
    Body: UpdateNoteOptions,
    Reply: {
      updatedAt: Note['updatedAt'],
    }
  }>('/', {
    schema: {
      body: NoteOptionsShema,
    },
    config: {
      policy: [
        'authRequired',
      ],
    },
  }, async (request, reply) => {
    /**
     * @todo Check user access right
     */
    const { id, content } = request.body;

    const note = await noteService.updateNoteContentByPublicId(id, content);

    return reply.send({
      updatedAt: note.updatedAt,
    });
  });


  /**
   * Get note by custom hostname
   */
  fastify.get<{
    Params: ResolveHostnameOptions,
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
