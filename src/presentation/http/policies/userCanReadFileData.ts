import hasProperty from '@infrastructure/utils/hasProperty.js';
import type { PolicyContext } from '../types/PolicyContext.js';
import { isEmpty, notEmpty } from '@infrastructure/utils/empty.js';
import type UploadedFile from '@domain/entities/file.js';
import { FileTypes } from '@domain/entities/file.js';

/**
 * Policy to check does user have permission to access file data,
 * if file is a part of note
 *
 * @param context - Context, object containing Fatify request, Fastify reply and domain services
 */
export default async function userCanReadFileData(context: PolicyContext): Promise<void> {
  const { request, reply, domainServices } = context;
  const { userId } = request;

  let fileType: FileTypes;
  let key: UploadedFile['key'];

  /**
   * Check that key and type are provided
   */
  if (hasProperty(request.params, 'key') && notEmpty(request.params.key) && hasProperty(request.params, 'type') && notEmpty(request.params.key)) {
    fileType = request.params.type as FileTypes;
    key = request.params.key as UploadedFile['key'];
  } else {
    return await reply.notAcceptable('Key or type not provided');
  }

  /**
   * Check if passed type is note attachement and check user rights
   */
  if (fileType === FileTypes.NoteAttachment) {
    const fileLocation = await domainServices.fileUploaderService.getFileLocationByKey(fileType, key);

    if (fileLocation === null) {
      return await reply.notFound('File with such key and type not found');
    }

    const noteSettings = await domainServices.noteSettingsService.getNoteSettingsByNoteId(fileLocation.noteId);

    if (noteSettings.isPublic === false) {
      if (isEmpty(userId)) {
        return await reply.unauthorized();
      }

      const memberRole = await domainServices.noteSettingsService.getUserRoleByUserIdAndNoteId(userId, fileLocation.noteId);

      if (isEmpty(memberRole)) {
        return await reply.forbidden();
      }
    }
  }
}
