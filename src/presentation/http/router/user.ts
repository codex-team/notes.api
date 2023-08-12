import type { FastifyPluginCallback } from 'fastify';
import type { Middlewares } from '@presentation/http/middlewares/index.js';
import type UserService from '@domain/service/user.js';

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
  fastify.get('/myself', { preHandler: [opts.middlewares.authRequired, opts.middlewares.withUser] }, async (request, reply) => {
    const userId = request.ctx.auth.id;

    const user = await userService.getUserById(userId);

    return reply.send({
      data: user,
    });
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