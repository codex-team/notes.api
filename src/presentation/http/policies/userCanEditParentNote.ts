import { isEmpty } from '@infrastructure/utils/empty.js';
import { MemberRole } from '@domain/entities/team.js';
import type { PolicyContext } from '@presentation/http/types/PolicyContext.js';
import { getRequestLogger } from '@infrastructure/logging/index.js';

/**
 * Policy to check whether a user has permission to edit the parent note passed in request body
 * Parent note should be resolved by parentNoteResolver middleware
 * @param context - Context object, containing Fatify request, Fastify reply and domain services
 */
export default async function userCanEditParentNote(context: PolicyContext): Promise<void> {
  const { request, reply, domainServices } = context;
  const logger = getRequestLogger('policies').child({ policy: 'userCanEditParentNote' });

  const { userId } = request;

  /**
   * If user is not authorized, we can't check his permissions
   */
  if (isEmpty(userId)) {
    logger.warn('User not authenticated for parent note edit access');

    return await reply.unauthorized();
  };

  /**
   * If parent note is not passed, there is nothing to check
   */
  if (isEmpty(request.parentNote)) {
    return;
  };

  const memberRole = await domainServices.noteSettingsService.getUserRoleByUserIdAndNoteId(request.userId!, request.parentNote.id);

  /**
   * If user has a Read Role or is not in team at all,
   * he doesn't have permission to add child notes to the parent note
   */
  if (memberRole !== MemberRole.Write) {
    logger.warn('User does not have write permission for parent note');

    return await reply.forbidden('You don\'t have permission to edit the parent note');
  }
}
