import type { preHandlerHookHandler } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { getLogger } from '@infrastructure/logging/index.js';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type { MemberRole } from '@domain/entities/team';

/**
 * Add middleware to resolve Member's role in a team by user id and note id and add it to request
 *
 * @param noteSettingsService - note settings domain service
 */
export default function useMemberRoleResolver(noteSettingsService: NoteSettingsService): {
    /**
     * Resolve Member's role in a team by user id and note id and add it to request
     *
     * Use this middleware as "preHandler" hook with a particular route
     */
    memberRoleResolver: preHandlerHookHandler;
} {
  /**
   * Get logger instance
   */
  const logger = getLogger('appServer');

  return {
    memberRoleResolver: async function memberRoleResolver(request, reply) {
      // if MemberRole equals null, it means that user is not in the team
      let memberRole: MemberRole | null;

      try {
        if (!request.note) {
          throw new Error('Note was not resolved');
        }

        // If user is not authenticated, we can't resolve Member role
        if (request.userId === null) {
          request.memberRole = null;
        } else {
          memberRole = await noteSettingsService.getUserRoleByUserIdAndNoteId(request.userId, request.note.id);
          request.memberRole = memberRole;
        }
      } catch (error) {
        logger.error('Can not resolve Member role by note and user');
        logger.error(error);

        await reply
          .code(StatusCodes.NOT_ACCEPTABLE)
          .send({
            message: 'Team member not found',
          });
      }
    },
  };
}
