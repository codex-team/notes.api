import hasProperty from '@infrastructure/utils/hasProperty.js';
import type { PolicyContext } from '../types/PolicyContext.js';
import { isEmpty, notEmpty } from '@infrastructure/utils/empty.js';
import type { NoteInternalId } from '@domain/entities/note.js';

/**
 * Policy to check does user have permission to access file data,
 * if file is a part of note
 *
 * @param context - Context, object containing Fatify request, Fastify reply and domain services
 */
export default async function userCanReadFileData(context: PolicyContext): Promise<void> {
  const { request, reply, domainServices } = context;
  const { userId } = request;

  let noteId: NoteInternalId | null = null;

  /**
   * Get note id by file key if file is a part of note
   */
  if (hasProperty(request.params, 'key') && notEmpty(request.params.key)) {
    noteId = await domainServices.fileUploaderService.getNoteIdByFileKey(request.params.key as string);
  } else {
    return await reply.notAcceptable('Key not provided');
  }

  /**
   * If note id is not resolved, we have no need to check permissions
   */
  if (notEmpty(noteId)) {
    const noteSettings = await domainServices.noteSettingsService.getNoteSettingsByNoteId(noteId);

    if (noteSettings.isPublic) {
      return;
    }

    if (isEmpty(userId)) {
      return await reply.unauthorized();
    }

    const memberRole = await domainServices.noteSettingsService.getUserRoleByUserIdAndNoteId(userId, noteId);

    if (isEmpty(memberRole)) {
      return await reply.forbidden();
    }
  }
}
