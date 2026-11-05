import type { FastifyRequest, preHandlerHookHandler } from 'fastify';
import type NoteService from '@domain/service/note.js';
import { notEmpty } from '@infrastructure/utils/empty.js';
import hasProperty from '@infrastructure/utils/hasProperty.js';
import { getRequestLogger } from '@infrastructure/logging/index.js';
import type { NotePublicId } from '@domain/entities/note.js';

/**
 * Add middleware for resolve parent note passed in request body and add it to request
 * @param noteService - note domain service
 */
export default function useParentNoteResolver(noteService: NoteService): {
  /**
   * Resolve parent note by public id passed in request body and add it to request
   * If request body has no parent note id, nothing is resolved
   *
   * Use this middleware as "preHandler" hook with a particular route
   */
  parentNoteResolver: preHandlerHookHandler;
} {
  /**
   * Get parent note public id from request body
   * POST /note accepts it as "parentId", relation routes accept it as "parentNoteId"
   * @param requestData - request body
   */
  function getParentNotePublicId(requestData: FastifyRequest['body']): NotePublicId | undefined {
    if (hasProperty(requestData, 'parentId') && notEmpty(requestData.parentId)) {
      return requestData.parentId as NotePublicId;
    }

    if (hasProperty(requestData, 'parentNoteId') && notEmpty(requestData.parentNoteId)) {
      return requestData.parentNoteId as NotePublicId;
    }
  }

  return {
    parentNoteResolver: async function parentNoteResolver(request, reply) {
      const logger = getRequestLogger('middlewares').child({ middleware: 'parentNoteResolver' });
      const parentPublicId = getParentNotePublicId(request.body);

      if (parentPublicId === undefined) {
        return;
      }

      try {
        request.parentNote = await noteService.getNoteByPublicId(parentPublicId);
      } catch (error) {
        logger.error('Invalid parent note public id passed');
        logger.error(error);

        await reply.notAcceptable('Parent note not found');
      }
    },
  };
}
