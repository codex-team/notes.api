import type { preHandlerHookHandler } from 'fastify';
import { getLogger } from '@infrastructure/logging/index.js';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type { MemberRole } from '@domain/entities/team.js';
import { isEmpty } from '@infrastructure/utils/empty.js';

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
      /** If MemberRole equals null, it means that user is not in the team or is not authenticated */
      let memberRole: MemberRole | undefined;

      try {
        if (isEmpty(request.note)) {
          throw new Error('Note was not resolved');
        }

        /** If user is not authenticated, we can't resolve his role */
        if (isEmpty(request.userId)) {
          memberRole = undefined;
        } else {
          memberRole = await noteSettingsService.getUserRoleByUserIdAndNoteId(request.userId, request.note.id);
        }

        if (memberRole !== undefined) {
          request.memberRole = memberRole;
        }
      } catch (error) {
        logger.error('Can not resolve Member role by note [id = ${request.note.id}] and user [id = ${request.userId}]');
        logger.error(error);

        await reply.notAcceptable('Team member not found');
      }
    },
  };
}
