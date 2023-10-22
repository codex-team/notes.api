import type { FastifyPluginCallback } from 'fastify';
import type UserService from '@domain/service/user.js';
import type User from '@domain/entities/user.js';
import type EditorToolsService from '@domain/service/editorTools';

/**
 * Interface for the user router
 */
interface UserRouterOptions {
  /**
   * User service instance
   */
  userService: UserService,

  /**
   * Service editor tool
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
const UserRouter: FastifyPluginCallback<UserRouterOptions> = (fastify, opts, done) => {
  /**
   * Manage user data
   */
  const userService = opts.userService;
  const editorToolsService = opts.editorToolsService;

  /**
   * Get user by session
   */
  fastify.get<{
    Reply: Pick<User, 'id' | 'name' | 'email' | 'photo'>,
  }>('/myself', {
    config: {
      policy: [
        'authRequired',
      ],
    },
    schema: {
      response: {
        '2xx': {
          $ref: 'User',
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.userId as number;

    const user = await userService.getUserById(userId);

    if (user === null) {
      return reply.notFound('User not found');
    }

    return reply.send(user);
  });

  /**
   * Get user editor tools
   */
  fastify.get('/editor-tools', {
    config: {
      policy: [
        'authRequired',
      ],
    },
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
  }, async (request, reply) => {
    const userId = request.userId as number;

    const userEditorToolIds = await userService.getUserEditorTools(userId);
    const defaultEditorTools = await editorToolsService.getDefaultEditorTools();
    const uniqueDefaultEditorTools = defaultEditorTools.filter(({ id }) => !userEditorToolIds.includes(id));
    const userEditorTools = await editorToolsService.getToolsByIds(userEditorToolIds) ?? [];

    // Combine user tools and default tools
    // TODO: load tools in notes service
    const mergedTools = [...userEditorTools, ...uniqueDefaultEditorTools];

    return reply.send({
      data: mergedTools,
    });
  });

  /**
   * Add editor tool to user extensions.
   * These editor tools are used when creating new notes.
   * Tool is linked by it's id.
   */
  fastify.post<{
    Body: { toolId: string }
  }>('/editor-tools', {
    config: {
      policy: [
        'authRequired',
      ],
    },
    schema: {
      body: {
        toolId: {
          type: 'string',
          description: 'Unique editor tool id',
        },
      },
    },
  }, async (request, reply) => {
    const toolId = request.body.toolId;
    const userId = request.userId as number;

    await userService.addUserEditorTool({
      userId,
      toolId,
    });

    return reply.send({
      data: toolId,
    });
  });

  done();
};

export default UserRouter;
