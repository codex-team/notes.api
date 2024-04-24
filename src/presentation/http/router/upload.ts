import type FileUploaderService from '@domain/service/fileUploader.service.js';
import { fastifyMultipart, type MultipartFile } from '@fastify/multipart';
import type { FastifyPluginCallback } from 'fastify';
import type NoteService from '@domain/service/note.js';
import useNoteResolver from '../middlewares/note/useNoteResolver.js';
import type { NoteAttachmentFileLocation } from '@domain/entities/file.js';
import { StatusCodes } from 'http-status-codes';

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

const UploadRouter: FastifyPluginCallback<UploadRouterOptions> = async (fastify, opts, done) => {
  const { fileUploaderService } = opts;

  /**
   * Prepare note id resolver middleware
   * It should be used in routes that accepts note public id
   */
  const { noteResolver } = useNoteResolver(opts.noteService);

  await fastify.register(fastifyMultipart, {
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
    schema: {
      consumes: [ 'multipart/form-data' ],
      params: {
        notePublicId: {
          $ref: 'NoteSchema#/properties/id',
        },
      },
      body: {
        type: 'object',
        required: [ 'file' ],
        properties: {
          file: { isFile: true },
        },
      },
      response: {
        '2xx': {
          type: 'object',
          description: 'File key to get it from the API',
          key: {
            $ref: 'UploadSchema#/properties/key',
          },
        },
      },
    },
    attachValidation: true,
    preHandler: [ noteResolver ],
  }, async (request, reply) => {
    /**
     * @todo solve trouble with crashing app, when validations is not passed
     */
    if (request.validationError) {
      return reply.code(StatusCodes.BAD_REQUEST).send(request.validationError);
    }
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
      schema: {
        params: {
          key: {
            $ref: 'UploadSchema#/properties/key',
          },
        },

        response: {
          '2xx': {
            description: 'Generated buffer',
            properties: {
              fileData: { type: 'string' },
            },
          },
        },
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

