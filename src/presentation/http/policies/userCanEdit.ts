import { isEmpty } from '@infrastructure/utils/empty.js';
import { MemberRole } from '@domain/entities/team.js';
import type { PolicyContext } from '@presentation/http/types/PolicyContext.js';
import { getRequestLogger } from '@infrastructure/logging/index.js';

/**
 * Policy to check whether a user has permission to edit the note
 * @param context - Context object, containing Fatify request, Fastify reply and domain services
 */
export default async function userCanEdit(context: PolicyContext): Promise<void> {
  const { request, reply, domainServices } = context;
  const logger = getRequestLogger('policies').child({ policy: 'userCanEdit' });

  const { userId } = request;

  /**
   * If user is not authorized, we can't check his permissions
   */
  if (isEmpty(userId)) {
    logger.warn('User not authenticated for edit access');

    return await reply.unauthorized();
  };

  /**
   * If note is not resolved, we can't check permissions
   */
  if (isEmpty(request.note)) {
    logger.warn('Note not found for edit permission check');

    return await reply.notAcceptable('Note not found');
  };

  const memberRole = await domainServices.noteSettingsService.getUserRoleByUserIdAndNoteId(request.userId!, request.note.id);

  /**
   * If user has a Read Role or is not in team at all,
   * he doesn't have permission to edit the note
   */
  if (memberRole !== MemberRole.Write) {
    logger.warn('User does not have write permission for note');

    return await reply.forbidden();
  }

  logger.debug('User edit permission check completed successfully');
}
