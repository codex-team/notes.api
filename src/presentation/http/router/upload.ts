import type { FileLocation, FileType } from '@domain/entities/file.js';
import type FileUploaderService from '@domain/service/fileUploader.service.js';
import { fastifyMultipart, type MultipartFile, type MultipartValue } from '@fastify/multipart';
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

  /**
   * Limit for uploaded files size
   */
  fileSizeLimit: number;
}

const UploadRouter: FastifyPluginCallback<UploadRouterOptions> = (fastify, opts, done) => {
  const { fileUploaderService } = opts;

  void fastify.register(fastifyMultipart, {
    limits: {
      fieldSize: opts.fileSizeLimit,
    },
    attachFieldsToBody: true,
  });

  fastify.post<{
    Body: {
      /**
       * File to upload
       */
      file: MultipartFile;

      /**
       * File type
       */
      type: MultipartValue<FileType>;

      /**
       * Note public id, if file is related to a note
       */
      location: MultipartValue<FileLocation>;
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

