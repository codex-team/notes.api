import type { FileTypes } from '@domain/entities/file';
import type { NotePublicId } from '@domain/entities/note.js';
import type FileUploaderService from '@domain/service/fileUploader.service.js';
import type { MultipartFile, MultipartValue } from '@fastify/multipart';
import type { FastifyPluginCallback } from 'fastify';
import useNoteResolver from '../middlewares/note/useNoteResolver.js';
import type NoteService from '@domain/service/note.js';

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

/**
 * Interface for upload file body
 */
interface UploadFileBody {
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
  notePublicId?: MultipartValue<NotePublicId>;
}

const UploadRouter: FastifyPluginCallback<UploadRouterOptions> = (fastify, opts, done) => {
  const { fileUploaderService } = opts;
  const { noteService } = opts;

  /**
   * Prepare note id resolver middleware
   * It should be used in routes that accepts note public id
   */
  const { softNoteResolverForUploadFileRequest } = useNoteResolver(noteService);

  fastify.post<{
    Body: UploadFileBody;
  }>('/', {
    config: {
      policy: [
        'authRequired',
        'userCanUpload',
      ],
    },
    preHandler: [
      softNoteResolverForUploadFileRequest,
    ]
  }, async (request, reply) => {
    const { userId } = request;
    const { note } = request;

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
    },async (request, reply) => {
      const fileData = await fileUploaderService.getFileDataByKey(request.params.key);

      return reply.send(fileData);
    });

  done();
};

export default UploadRouter;

