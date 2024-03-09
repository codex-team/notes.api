import { isEmpty } from '@infrastructure/utils/empty.js';
import { notEmpty } from '@infrastructure/utils/empty.js';
import type { PolicyContext } from '@presentation/http/types/PolicyContext.js';

/**
 * Policy to check does user have permission to access note
 *
 * @param context - Context, object containing Fatify request, Fastify reply and domain services
 */
export default async function notePublicOrUserInTeam(context: PolicyContext): Promise<void> {
  const { request, reply, domainServices } = context;

  const { userId } = request;

  /**
   * If note or noteSettings not resolved, we can't check permissions
   */
  if (isEmpty(request.note) || isEmpty(request.noteSettings)) {
    return await reply.notAcceptable('Note not found');
  };

  const { isPublic } = request.noteSettings;
  let memberRole;

  /**
   * If user is not authorized, we can't check his role
   * If note is public, we don't need to check for the role
   */
  if (notEmpty(userId) && isPublic === false) {
    memberRole = await domainServices.noteSettingsService.getUserRoleByUserIdAndNoteId(userId, request.note.id);
  }

  /**
   * If note is public, everyone can access it
   * If note is private, only team member can access it
   */
  if (isPublic === false) {
    /** If user is unathorized we return 401 unauthorized */
    if (isEmpty(userId)) {
      return await reply.unauthorized();
    /** If user is authorized, but is not in the team, we return 403 forbidden */
    } else if (isEmpty(memberRole)) {
      return await reply.forbidden();
    }
  }
}
