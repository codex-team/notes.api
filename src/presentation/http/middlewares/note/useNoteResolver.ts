import type { FastifyRequest, preHandlerHookHandler } from 'fastify';
import type NoteService from '@domain/service/note.js';
import notEmpty from '@infrastructure/utils/notEmpty.js';
import { StatusCodes } from 'http-status-codes';
import hasProperty from '@infrastructure/utils/hasProperty.js';
import { getLogger } from '@infrastructure/logging/index.js';
import type { NotePublicId } from '@domain/entities/note';

/**
 * Add middleware for resolve Note internal id by public id and add it to request
 *
 * @param noteService - note domain service
 */
export default function useNoteResolver(noteService: NoteService): {
  /**
   * Resolve Note internal id by public id and add it to request
   *
   * Use this middleware as "preHandler" hook with a particular route
   */
  noteIdResolver: preHandlerHookHandler;
} {
  /**
   * Get logger instance
   */
  const logger = getLogger('appServer');

  return {
    noteIdResolver: async function noteIdResolver(request, reply) {
      if (hasProperty(request.params, 'notePublicId') && notEmpty(request.params.notePublicId)) {
        const publicId = request.params.notePublicId as NotePublicId;

        try {
          const note = await noteService.getNoteByPublicId(publicId);

          request.noteId = note.id;
        } catch (error) {
          logger.error('Invalid Note public id: ' + publicId);
          logger.error(error);

          await reply
            .code(StatusCodes.UNAUTHORIZED)
            .send({
              message: 'Permission denied',
            });
        }
      }
    },
  };
}
