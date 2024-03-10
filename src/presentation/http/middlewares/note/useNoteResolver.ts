import type { FastifyRequest, preHandlerHookHandler } from 'fastify';
import type NoteService from '@domain/service/note.js';
import { notEmpty } from '@infrastructure/utils/empty.js';
import { StatusCodes } from 'http-status-codes';
import hasProperty from '@infrastructure/utils/hasProperty.js';
import { getLogger } from '@infrastructure/logging/index.js';
import type { Note, NotePublicId } from '@domain/entities/note.js';
import type { MultipartValue } from '@fastify/multipart';

/**
 * Add middleware for resolve Note by public id and add it to request
 *
 * @param noteService - note domain service
 */
export default function useNoteResolver(noteService: NoteService): {
  /**
   * Resolve Note by public id and add it to request
   *
   * Use this middleware as "preHandler" hook with a particular route
   */
  noteResolver: preHandlerHookHandler;

  /**
   * Resolve Note by public id and add it to request
   *
   * Use this middleware as "preHandler" hook with a particular route
   * This middleware is used for soft note resolving, so it doesn't return 404 if note not found
   * It uses for upload file request, where note is not required and note public id is in body
   */
  softNoteResolverForUploadFileRequest: preHandlerHookHandler;
} {
  /**
   * Get logger instance
   */
  const logger = getLogger('appServer');

  /**
   * Search for Note by public id in passed payload and resolves a note by it
   *
   * @param requestData - fastify request data. Can be query, params or body
   */
  async function resolveNoteByPublicId(requestData: FastifyRequest['query'] | FastifyRequest['body'] | FastifyRequest['params']): Promise<Note | undefined> {
    /**
     * Request params validation
     */
    if (hasProperty(requestData, 'notePublicId') && notEmpty(requestData.notePublicId)) {
      const publicId = requestData.notePublicId as NotePublicId;

      return await noteService.getNoteByPublicId(publicId);
    }
  }

  /**
   * Search for Note by public id in passed body in upload file request and resolves a note by it
   *
   * @param requestData - fastify request data. Can be query, params or body
   */
  async function resolveNoteByMultipartValueInUploadFileBody(requestData: FastifyRequest['body']): Promise<Note | undefined> {
    if (hasProperty(requestData, 'notePublicId') && notEmpty(requestData.notePublicId)) {
      const publicId = requestData.notePublicId as MultipartValue<NotePublicId>;

      return await noteService.getNoteByPublicId(publicId.value);
    }
  }

  return {
    noteResolver: async function noteIdResolver(request, reply) {
      let note: Note | undefined;

      let statusCode = StatusCodes.NOT_ACCEPTABLE;

      /**
       * This status code occurs only when request is get note by id
       */
      if (request.method == 'GET') {
        statusCode = StatusCodes.NOT_FOUND;
      }
      try {
        /**
         * All methods (GET, POST, PATCH, etc) could have note public id just in route params,
         * so we don't check for query and body at the moment
         */
        note = await resolveNoteByPublicId(request.params);

        if (note) {
          request.note = note;
        } else {
          throw new Error('Note not found');
        }
      } catch (error) {
        logger.error('Invalid Note public passed');
        logger.error(error);

        await reply
          .code(statusCode)
          .send({
            message: 'Note not found',
          });
      }
    },
    softNoteResolverForUploadFileRequest: async function softNoteIdResolver(request) {
      const note = await resolveNoteByMultipartValueInUploadFileBody(request.body);

      if (note) {
        request.note = note;
      }
    },
  };
}
