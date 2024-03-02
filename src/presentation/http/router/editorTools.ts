import type { FastifyPluginCallback } from 'fastify';
import type EditorToolsService from '@domain/service/editorTools.js';
import type EditorTool from '@domain/entities/editorTools.js';
import { StatusCodes } from 'http-status-codes';

/**
 * Interface for the editor tools router
 */
interface EditorToolsRouterOptions {
  /**
   * Editor tools service instance
   */
  editorToolsService: EditorToolsService,
}


/**
 * Manages user
 *
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const EditorToolsRouter: FastifyPluginCallback<EditorToolsRouterOptions> = (fastify, opts, done) => {
  /**
   * Manage editor tools data
   */
  const { editorToolsService } = opts;

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
    Body: EditorTool
  }>('/add-tool', {
    schema: {
      body: {
        $ref: 'EditorToolSchema',
      },
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

    const tool = await editorToolsService.addTool(editorTool);

    return reply.status(StatusCodes.OK).send({
      data: tool,
    });
  });

  done();
};

export default EditorToolsRouter;
