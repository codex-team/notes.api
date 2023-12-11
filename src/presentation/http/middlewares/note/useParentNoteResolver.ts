import type { FastifyRequest, preHandlerHookHandler } from 'fastify';
import type NoteService from '@domain/service/note.js';
import { notEmpty } from '@infrastructure/utils/empty.js';
import hasProperty from '@infrastructure/utils/hasProperty.js';
import type { Note, NotePublicId } from '@domain/entities/note';
import { StatusCodes } from 'http-status-codes';
import { getLogger } from '@infrastructure/logging/index.js';

/**
 * Add middleware for resolve parent note by public id and add it to request
 *
 * @param noteService - note domain service
 */
export default function useParentNoteResolver(noteService: NoteService): {
  /**
   * Resolve parent note by public id and add it to request
   *
   * Use this middleware as "preHandler" hook with a particular route
   */
  parentNoteResolver: preHandlerHookHandler;
} {
  /**
   * Get logger instance
   */
  const logger = getLogger('appServer');

  /**
   * Search for parent Note by public id in passed payload and resolves a note by it
   *
   * @param requestData - fastify request data, can be query
   */
  async function resolveParentNoteByPublicId(requestData: FastifyRequest['query']): Promise<Note | undefined> {
    /**
     * Query params validation
     */
    if (hasProperty(requestData, 'parentId') && notEmpty(requestData.parentId)) {
      const publicId = requestData.parentId as NotePublicId;

      return await noteService.getNoteByPublicId(publicId);
    }
  }

  return {
    parentNoteResolver: async function parentNoteIdResolver(request, reply) {
      try {
        const parentNote = await resolveParentNoteByPublicId(request.query);

        if (parentNote) {
          request.parentNote = parentNote;
        } else if (parentNote === null) {
          throw new Error('Note not found');
        }
      } catch (error) {
        logger.error('Invalid Note public passed');
        logger.error(error);

        await reply
          .code(StatusCodes.NOT_ACCEPTABLE)
          .send({
            message: 'Note not found',
          });
      }
    },
  };
}