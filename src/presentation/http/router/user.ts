import type { FastifyPluginCallback } from 'fastify';
import type { Middlewares } from '@presentation/http/middlewares/index.js';
import type UserService from '@domain/service/user.js';
import type User from '@domain/entities/user.js';

/**
 * Interface for the user router
 */
interface UserRouterOptions {
  /**
   * User service instance
   */
  userService: UserService,

  /**
   * Middlewares
   */
  middlewares: Middlewares,
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

  /**
   * Get user by session
   */
  fastify.get<{
    Reply: Pick<User, 'id' | 'name' | 'email' | 'photo'>,
  }>('/myself', {
    preHandler: [
      opts.middlewares.authRequired,
      opts.middlewares.withUser,
    ],
    schema: {
      response: {
        '2xx': {
          $ref: 'User',
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.ctx.auth.id;

    const user = await userService.getUserById(userId);

    if (user === null) {
      return fastify.notFound(reply, 'User not found');
    }

    return reply.send(user);
  });

  /**
   * Get user extensions
   */
  fastify.get('/editor-tools', { preHandler: [opts.middlewares.authRequired, opts.middlewares.withUser] }, async (request, reply) => {
    const userId = request.ctx.auth.id;

    const editorTools = await userService.getUserEditorTools(userId) ?? [];

    return reply.send({
      data: editorTools,
    });
  });

  done();
};

export default UserRouter;
