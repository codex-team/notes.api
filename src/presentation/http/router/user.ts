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
      return fastify.notFound(reply, 'User not found');
    }

    return reply.send(user);
  });

  /**
   * Get user extensions
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

    const userExtensions = await userService.getUserExtensions(userId);
    const userEditorToolIds = userExtensions?.editorTools?.map(tools => tools.id) ?? [];
    const editorTools = await editorToolsService.getToolsByIds(userEditorToolIds) ?? [];

    return reply.send({
      data: editorTools,
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
    const editorToolId = request.body.toolId;
    const userId = request.userId as number;

    await userService.addUserEditorTool({
      userId,
      editorToolId,
    });

    return reply.send({
      data: editorToolId,
    });
  });

  done();
};

export default UserRouter;
