import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import { StatusCodes } from 'http-status-codes';
import type { ErrorResponse, SuccessResponse } from '@presentation/http/types/HttpResponse.js';
import type Note from '@domain/entities/note.js';
import type NotesSettings from '@domain/entities/notesSettings.js';
import type { Middlewares } from '@presentation/http/middlewares/index.js';

/**
 * Get note by id options
 */
interface GetNoteByIdOptions {
  /**
   * Note id
   */
  id: NotesSettings['publicId'];
}

/**
 * Add note options
 */
interface AddNoteOptions {
  /**
   * Note title
   */
  title: string;

  /**
   * Note content
   */
  content: JSON;

  /**
   * Is note public
   */
  enabled?: boolean;
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
  fastify.get<{ Params: GetNoteByIdOptions }>('/:id', { preHandler: opts.middlewares.withUser }, async (request, reply) => {
    const params = request.params;
    /**
     * TODO: Validate request params
     */
    const { id } = params;

    const note = await noteService.getNoteById(id);

    /**
     * Check if note does not exist
     */
    if (!note) {
      const response: ErrorResponse = {
        status: StatusCodes.NOT_FOUND,
        message: 'Note not found',
      };

      return reply.send(response);
    }

    const noteSettings = await noteService.getNoteSettingsByNoteId(note.id);

    if (noteSettings?.enabled) {
      /**
       * Create success response
       */
      const response: SuccessResponse<Note> = {
        data: note,
      };

      return reply.send(response);
    }

    /**
     * TODO: add check for collaborators by request context from auth middleware
     */

    const response: ErrorResponse = {
      status: StatusCodes.UNAUTHORIZED,
      message: 'Permission denied',
    };

    reply.send(response);
  });

  /**
   * Get noteSettings by id
   */
  fastify.get<{ Params: GetNoteByIdOptions }>('/:id/settings', async (request, reply) => {
    const params = request.params;
    /**
     * TODO: Validate request params
     */
    const { id } = params;

    const noteSettings = await noteService.getNoteSettingsByPublicId(id);

    /**
     * Check if note does not exist
     */
    if (!noteSettings) {
      const response: ErrorResponse = {
        status: StatusCodes.NOT_FOUND,
        message: 'Note not found',
      };

      return reply.send(response);
    }

    /**
     * Create success response
     */
    const response: SuccessResponse<NotesSettings> = {
      data: noteSettings,
    };

    return reply.send(response);
  });

  /**
   * Patch noteSettings by note public id
   */
  fastify.patch<{
    Body: Partial<NotesSettings>,
    Params: GetNoteByIdOptions
  }>('/:id/settings', { preHandler: [opts.middlewares.authRequired, opts.middlewares.withUser] }, async (request, reply) => {
    const noteId = request.params.id;

    /**
     * TODO: check is user collaborator
     */

    const updatedNoteSettings = await noteService.patchNoteSettings(request.body, noteId);

    if (!updatedNoteSettings) {
      const response: ErrorResponse = {
        status: StatusCodes.NOT_FOUND,
        message: 'Note setting not found',
      };

      return reply.send(response);
    }

    const response: SuccessResponse<NotesSettings> = {
      data: updatedNoteSettings,
    };

    return reply.send(response);
  });

  /**
   * Add new note
   */
  fastify.post<{ Body: AddNoteOptions }>('/', { preHandler: [opts.middlewares.authRequired, opts.middlewares.withUser] }, async (request, reply) => {
    /**
     * TODO: Validate request query
     */
    const { title, content, enabled } = request.body;

    /**
     * Get user id from request context, because we have auth middleware
     */
    const user = request.ctx.auth.id;

    const addedNote = await noteService.addNote(title, content, user);

    const noteSettings = await noteService.addNoteSettings(addedNote.id, enabled);

    return reply.send(noteSettings.publicId);
  });

  /**
   * Get note by custom hostname
   */
  fastify.get<{ Params: ResolveHostnameOptions }>('/resolve-hostname/:hostname', async (request, reply) => {
    const params = request.params;

    const note = await noteService.getNoteByHostname(params.hostname);

    /**
     * Check if note does not exist
     */
    if (!note) {
      const response: ErrorResponse = {
        status: StatusCodes.NOT_FOUND,
        message: 'Note not found',
      };

      return reply.send(response);
    }

    /**
     * Create success response
     */
    const response: SuccessResponse<Note> = {
      data: note,
    };

    return reply.send(response);
  });

  done();
};

export default NoteRouter;
