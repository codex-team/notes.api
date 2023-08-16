import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import { StatusCodes } from 'http-status-codes';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse.js';
import type { Note, NotePublicId } from '@domain/entities/note.js';
import type NotesSettings from '@domain/entities/notesSettings.js';
import type { Middlewares } from '@presentation/http/middlewares/index.js';
import notEmpty from '@infrastructure/utils/notEmpty.js';

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
 * Interface for the note router.
 */
interface NoteRouterOptions {
  /**
   * Note service instance
   */
  noteService: NoteService,

  /**
   * Middlewares
   */
  middlewares: Middlewares,
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

  /**
   * Get note by id
   */
  fastify.get<{
    Params: GetNoteByIdOptions,
    Reply: Note | ErrorResponse
  }>('/:id', { preHandler: opts.middlewares.withUser }, async (request, reply) => {
    const params = request.params;
    /**
     * TODO: Validate request params
     */
    const { id } = params;

    const note = await noteService.getNoteById(id);

    /**
     * Check if note does not exist
     */
    if (note === null) {
      return fastify.notFound(reply, 'Note not found');
    }

    const noteSettings = await noteService.getNoteSettingsByNoteId(note.id);

    if (noteSettings?.enabled === true) {
      return reply.send(note);
    }

    /**
     * TODO: add check for collaborators by request context from auth middleware
     */
    return reply
      .code(StatusCodes.UNAUTHORIZED)
      .send({
        message: 'Permission denied',
      });
  });

  /**
   * Get noteSettings by id
   *
   * @todo move to the NoteSettings Router
   */
  fastify.get<{
    Params: GetNoteByIdOptions,
    Reply: NotesSettings
  }>('/:id/settings', async (request, reply) => {
    const params = request.params;
    /**
     * TODO: Validate request params
     */
    const { id } = params;

    const noteSettings = await noteService.getNoteSettingsByPublicId(id);

    /**
     * Check if note does not exist
     */
    if (!notEmpty(noteSettings)) {
      return fastify.notFound(reply, 'Note settings not found');
    }

    return reply.send(noteSettings);
  });

  /**
   * Patch noteSettings by note public id
   */
  fastify.patch<{
    Body: Partial<NotesSettings>,
    Params: GetNoteByIdOptions,
    Reply: NotesSettings,
  }>('/:id/settings', { preHandler: [opts.middlewares.authRequired, opts.middlewares.withUser] }, async (request, reply) => {
    const noteId = request.params.id;

    /**
     * TODO: check is user collaborator
     */

    const updatedNoteSettings = await noteService.patchNoteSettings(request.body, noteId);

    if (updatedNoteSettings === null) {
      return fastify.notFound(reply, 'Note settings not found');
    }

    return reply.send(updatedNoteSettings);
  });

  /**
   * Adds a new note.
   * Responses with note public id.
   */
  fastify.post<{
    Body: AddNoteOptions,
    Reply: { id: NotePublicId }
  }>('/', {
    preHandler: [
      opts.middlewares.authRequired,
      opts.middlewares.withUser,
    ],
  }, async (request, reply) => {
    /**
     * TODO: Validate request query
     */
    const { content } = request.body;

    /**
     * Get user id from request context, because we have auth middleware
     */
    const user = request.ctx.auth.id;

    const addedNote = await noteService.addNote(content, user);

    /**
     * @todo use event bus: emit 'note-added' event and subscribe to it in other modules like 'note-settings'
     */
    await noteService.addNoteSettings(addedNote.id);

    return reply.send({
      id: addedNote.publicId,
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
