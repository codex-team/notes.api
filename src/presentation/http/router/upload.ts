import type FileUploaderService from '@domain/service/fileUploader.service.js';
import { fastifyMultipart, type MultipartFile } from '@fastify/multipart';
import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import useNoteResolver from '../middlewares/note/useNoteResolver.js';
import type { NoteAttachmentFileLocation } from '@domain/entities/file.js';

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

  /**
   * Prepare note id resolver middleware
   * It should be used in routes that accepts note public id
   */
  const { noteResolver } = useNoteResolver(opts.noteService);

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
    }
  }>('/:notePublicId', {
    config: {
      policy: [
        'authRequired',
        'userCanEdit',
      ],
    },
    preHandler: [ noteResolver ],
  }, async (request, reply) => {
    const { userId } = request;

    const location: NoteAttachmentFileLocation = {
      noteId: request.note!.id as number,
    };

    const uploadedFileKey = await fileUploaderService.uploadFile(
      {
        data: await request.body.file.toBuffer(),
        mimetype: request.body.file.mimetype,
        name: request.body.file.filename,
      },
      location,
      {
        userId: userId!,
      }
    );

    return reply.send({
      key: uploadedFileKey,
    });
  });

  fastify.get<{
    Params: {
      key: string;
    }
    }>('/:notePublicId/:key', {
      config: {
        policy: [
          'notePublicOrUserInTeam',
        ],
      },
      preHandler: [ noteResolver ],
    }, async (request, reply) => {
      const fileLocation: NoteAttachmentFileLocation = {
        noteId: request.note!.id as number,
      };

      const fileData = await fileUploaderService.getFileData(request.params.key, fileLocation);

      return reply.send(fileData);
    });

  done();
};

export default UploadRouter;

