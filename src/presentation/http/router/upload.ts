import type { FileTypes, Location } from '@domain/entities/file.js';
import type FileUploaderService from '@domain/service/fileUploader.service.js';
import type { MultipartFile, MultipartValue } from '@fastify/multipart';
import type { FastifyPluginCallback } from 'fastify';
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

const UploadRouter: FastifyPluginCallback<UploadRouterOptions> = (fastify, opts, done) => {
  const { fileUploaderService } = opts;

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
      location: MultipartValue<Location>;
    }
  }>('/', {
    config: {
      policy: [
        'authRequired',
        'userCanUploadFile',
      ],
    },
  }, async (request, reply) => {
    const { userId } = request;

    const { location } = request.body;

    const uploadedFileKey = await fileUploaderService.uploadFile(
      request.body.type.value,
      {
        data: await request.body.file.toBuffer(),
        mimetype: request.body.file.mimetype,
        name: request.body.file.filename,
      },
      location,
      {
        userId: userId as number,
      }
    );

    return reply.send({
      key: uploadedFileKey,
    });
  });

  fastify.get<{
    Params: {
      type: string;
      key: string;
    }
    }>('/:type/:key', {
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

