import type { FastifyPluginCallback } from 'fastify';
import type EditorToolsService from '@domain/service/editorTools.js';
import type EditorTool from '@domain/entities/editorTools.js';

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
  fastify.get('/all', async (_, reply) => {
    const tools = await editorToolsService.getTools();

    return reply.send({
      data: tools,
    });
  });

  /**
   * Add editor tool to the library of all tools
   */
  fastify.post<{ Body: EditorTool }>('/add-tool', {
    schema: {
      body: {
        pluginId: {
          type: 'string',
          description: 'Plugin id that editor will use, e.g. "warning", "list", "linkTool"'
        },
        name: {
          type: 'string',
          description: 'User-friendly name that will be shown in marketplace, .e.g "Warning tool 3000"'
        },
        class: {
          type: 'string',
          description: 'Name of the plugin\'s class, e.g. "LinkTool", "Checklist", "Header"'
        },
        source: {
          type: "object",
          properties: {
            cdn: {
              type: 'string',
              description: "Tool URL in content delivery network",
            }
          }
        }
      }
    }
  },async (request, reply) => {
    const editorTool = request.body;

    const tool = await editorToolsService.addTool(editorTool);

    return reply.send({
      data: tool,
    });
  });

  done();
};

export default EditorToolsRouter;
