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

    return reply.send(tools);
  });

  /**
   * Add editor tool to the library of all tools
   */
  fastify.post<{ Body: EditorTool }>('/add-tool', async (request, reply) => {
    const editorTool = request.body;

    const tools = await editorToolsService.addTool(editorTool);

    return reply.send(tools);
  });

  done();
};

export default EditorToolsRouter;
