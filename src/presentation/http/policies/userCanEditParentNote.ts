import { isEmpty, notEmpty } from '@infrastructure/utils/empty.js';
import hasProperty from '@infrastructure/utils/hasProperty.js';
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

  const { userId, body } = request;

  /**
   * POST /note passes parent note as "parentId", relation routes pass it as "parentNoteId"
   */
  const hasParentNoteId = (hasProperty(body, 'parentId') && notEmpty(body.parentId))
    || (hasProperty(body, 'parentNoteId') && notEmpty(body.parentNoteId));

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
  if (!hasParentNoteId) {
    return;
  };

  /**
   * If parent note is passed but not resolved, we can't check permissions
   * It happens if the route uses this policy without parentNoteResolver middleware
   */
  if (isEmpty(request.parentNote)) {
    logger.warn('Parent note not found for parent note edit permission check');

    return await reply.notAcceptable('Parent note not found');
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
