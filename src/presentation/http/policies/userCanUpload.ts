import { isEmpty, notEmpty } from '@infrastructure/utils/empty.js';
import type { PolicyContext } from '../types/PolicyContext.js';
import { MemberRole } from '@domain/entities/team.js';
import hasProperty from '@infrastructure/utils/hasProperty.js';
import type { FileLocation } from '@domain/entities/file.js';
import { FileType } from '@domain/entities/file.js';
import type { Note, NotePublicId } from '@domain/entities/note.js';

/**
 * Policy to check whether a user has permission to upload files, if file is a part of note
 * If note is resolved, we need to check permissions, in other case, we need to check only user authorization
 *
 * @param context - Context object, containing Fatify request, Fastify reply and domain services
 */
export default async function userCanUploadFile(context: PolicyContext): Promise<void> {
  const { request, reply, domainServices } = context;
  const { userId } = request;

  let fileType: FileType;
  let location: FileLocation;

  /**
   * User must be authorized to upload files
   */
  if (isEmpty(userId)) {
    return await reply.unauthorized();
  }

  /**
   * Check that key and type are provided
   */
  if (hasProperty(request.body, 'type') && notEmpty(request.body.type) && hasProperty(request.body, 'location') && notEmpty(request.body.location)) {
    fileType = request.body.type as FileType;
    location = request.body.location as FileLocation;
  } else {
    return await reply.notAcceptable('File type or location not provided');
  }

  /**
   * If file type is note attachement, check user permission for editing note
   */
  if (fileType === FileType.NoteAttachment) {
    if (hasProperty(location, 'noteId')) {
      let note: Note;

      try {
        note = await domainServices.noteService.getNoteByPublicId(location.noteId as NotePublicId);
      } catch {
        return await reply.notFound('Passed note not found');
      }

      const memberRole = await domainServices.noteSettingsService.getUserRoleByUserIdAndNoteId(userId, note.id);

      if (memberRole !== MemberRole.Write) {
        return await reply.forbidden();
      }
    } else {
      return await reply.forbidden('noteId must be provided');
    }
  }
}
