import type { FastifyPluginCallback } from 'fastify';
import type EditorToolsService from '@domain/service/editorTools.js';
import type { AddEditorToolDto } from './dto/AddEditorTool.dto.js';
import type FileUploaderService from '@domain/service/fileUploader.service.js';
import fastifyMultipart from '@fastify/multipart';
import { createFileId } from '@infrastructure/utils/id.js';

/**
 * Interface for the editor tools router
 */
interface EditorToolsRouterOptions {
  /**
   * Editor tools service instance
   */
  editorToolsService: EditorToolsService;

  /**
   * File uploader service instance, needed to upload tool cover
   */
  fileUploaderService: FileUploaderService;

  /**
   * Limit for uploaded files size
   */
  fileSizeLimit: number;
}

/**
 * Manages user
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const EditorToolsRouter: FastifyPluginCallback<EditorToolsRouterOptions> = async (fastify, opts, done) => {
  /**
   * Manage editor tools data
   */
  const { editorToolsService, fileUploaderService } = opts;

  await fastify.register(fastifyMultipart, {
    limits: {
      fieldSize: opts.fileSizeLimit,
    },
    attachFieldsToBody: true,
  });

  /**
   * Get all avaiable editor tools
   */
  fastify.get('/all', {
    schema: {
      response: {
        '2xx': {
          description: 'Editor tool fields',
          content: {
            'application/json': {
              schema: {
                data: {
                  type: 'array',
                  items: {
                    $ref: 'EditorToolSchema',
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (_, reply) => {
    const tools = await editorToolsService.getTools();

    return reply.send({
      data: tools,
    });
  });

  /**
   * Add editor tool to the library of all tools
   */
  fastify.post<{
    Body: AddEditorToolDto;
  }>('/add-tool', {
    config: {
      /**
       * @todo check if user is superadmin
       */
      policy: [
        'authRequired',
      ],
    },
    schema: {
      consumes: ['multipart/form-data'],
      // body: {
      //   $ref: 'AddEditorToolSchema',
      // },
      response: {
        '2xx': {
          description: 'Editor tool fields',
          content: {
            'application/json': {
              schema: {
                data: {
                  $ref: 'EditorToolSchema',
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const editorTool = request.body;
    const userId = request.userId as number;

    let coverKey: string | undefined = undefined;

    if (editorTool.cover) {
      const coverBuffer = await editorTool.cover.toBuffer();

      coverKey = await fileUploaderService.uploadFile({
        data: coverBuffer,
        name: createFileId(),
        mimetype: editorTool.cover.mimetype,
      }, {
        isEditorToolCover: true,
      }, {
        userId,
      });
    }

    const source: {
      cdn: string;
    } = editorTool.isDefault?.value !== undefined
      ? JSON.parse(String(editorTool.source.value)) as {
        cdn: string;
      }
      : {
          cdn: '',
        };

    const tool = await editorToolsService.addTool({
      title: String(editorTool.title?.value),
      name: String(editorTool.name?.value),
      exportName: String(editorTool.exportName?.value),
      description: String(editorTool.description?.value),
      source: source,
      isDefault: Boolean(editorTool.isDefault?.value ?? false),
      cover: coverKey ?? '',
    }, userId);

    return reply.send({
      data: tool,
    });
  });

  done();
};

export default EditorToolsRouter;
