import { isEmpty } from '@infrastructure/utils/empty.js';
import type { PolicyContext } from '../types/PolicyContext.js';
import { MemberRole } from '@domain/entities/team.js';

/**
 * Policy to check whether a user has permission to upload files, if file is a part of note
 * If note is resolved, we need to check permissions, in other case, we need to check only user authorization
 *
 * @param context - Context object, containing Fatify request, Fastify reply and domain services
 */
export default async function userCanUploadFileToNote(context: PolicyContext): Promise<void> {
  const { request, reply, domainServices } = context;
  const { userId } = request;

  /**
   * User must be authorized to upload files
   */
  if (isEmpty(userId)) {
    return await reply.unauthorized();
  }

  const { note } = request;

  /**
   * If note is resolved, we need to check permissions, because file is a part of note
   */
  if (!isEmpty(note)) {
    const memberRole = await domainServices.noteSettingsService.getUserRoleByUserIdAndNoteId(userId, note.id);

    if (memberRole !== MemberRole.Write) {
      return await reply.forbidden();
    }
  }
}
