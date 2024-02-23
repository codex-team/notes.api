import { isEmpty } from '@infrastructure/utils/empty.js';
import { MemberRole } from '@domain/entities/team.js';
import type { PolicyContext } from '@presentation/http/types/PolicyContext.js';

/**
 * Policy to check whether a user has permission to edit the note
 *
 * @param context - Context object, containing Fatify request, Fastify reply and domain services
 */
export default async function userCanEdit(context: PolicyContext): Promise<void> {
  const { request, reply, domainServices } = context;

  const { userId } = request;

  /**
   * If user is not authorized, we can't check his permissions
   */
  if (isEmpty(userId)) {
    return await reply.unauthorized();
  };

  /**
   * If note is not resolved, we can't check permissions
   */
  if (isEmpty(request.note)) {
    return await reply.notAcceptable('Note not found');
  };

  const memberRole = await domainServices.noteSettingsService.getUserRoleByUserIdAndNoteId(request.userId!, request.note.id);

  /**
   * If user is not a creator of the note and
   * user has a Read Role or is not in team at all,
   * he doesn't have permission to edit the note
   */
  if (memberRole !== MemberRole.Write) {
    return await reply.forbidden();
  }
}
