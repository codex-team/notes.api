import type { FileTypes } from '@domain/entities/file';
import type { Note, NotePublicId } from '@domain/entities/note.js';
import type FileUploaderService from '@domain/service/fileUploader.service.js';
import type { MultipartFile, MultipartValue } from '@fastify/multipart';
import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import { notEmpty } from '@infrastructure/utils/empty.js';

/**
 * Interface for upload router options
 */
interface UploadRouterOptions {
  /**
   * File uploader service
   */
  fileUploaderService: FileUploaderService;

  /**
   * Note service instance
   */
  noteService: NoteService;
}

const UploadRouter: FastifyPluginCallback<UploadRouterOptions> = (fastify, opts, done) => {
  const { fileUploaderService } = opts;
  const { noteService } = opts;

  fastify.post<{
    Body: {
      /**
       * File to upload
       */
      file: MultipartFile;

      /**
       * File type
       */
      type: MultipartValue<FileTypes>;

      /**
       * Note public id, if file is related to a note
       */
      noteId?: MultipartValue<NotePublicId>;
    }
  }>('/', {
    config: {
      policy: [
        'authRequired',
        'userCanUpload',
      ],
    },
  }, async (request, reply) => {
    const { userId } = request;

    /**
     * Get note id from request body
     * If note id is not provided, it means that file is not related to any note
     */
    const noteId = request.body.noteId?.value;

    let note: Note | undefined;

    if (notEmpty(noteId)) {
      note = await noteService.getNoteByPublicId(noteId);
    }

    const uploadedFileKey = await fileUploaderService.uploadFile({
      data: await request.body.file.toBuffer(),
      type: request.body.type.value,
      mimetype: request.body.file.mimetype,
      name: request.body.file.filename,
    }, {
      userId: userId as number,
      noteId: note?.id as number,
    });

    /**
     * Get current protocol, host and url
     */
    const currentProtocol = request.protocol;
    const currentHost = request.hostname;
    const currentUrl = request.url;

    return reply.send({
      url: `${currentProtocol}://${currentHost}${currentUrl}/${uploadedFileKey}`,
    });
  });

  fastify.get<{
    Params: {
      key: string;
    }
    }>('/:key', {
      config: {
        policy: [
          'authRequired',
          'userCanReadFileData',
        ],
      },
    }, async (request, reply) => {
      const fileData = await fileUploaderService.getFileDataByKey(request.params.key);

      return reply.send(fileData);
    });

  done();
};

export default UploadRouter;

