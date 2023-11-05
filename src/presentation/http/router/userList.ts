import type { FastifyPluginCallback } from 'fastify';
import type UserListService from '@domain/service/userList.js';

/**
 * Interface for the userList router
 */
interface UserListRouterOptions {
    /**
     * User list service instance
     */
    userListService: UserListService,

}

/**
 * User list router plugin
 *
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const UserListRouter: FastifyPluginCallback<UserListRouterOptions> = (fastify, opts, done) => {
  const userListService = opts.userListService;

  /**
   * Get user list for one page
   */
  fastify.get<{
    Querystring: {
      page: number;
    },
  }>('/', {
    config: {
      policy: [
        'authRequired',
      ],
    },
    schema: {
      querystring: {
        page: {
          type: 'number',
          minimum: 1,
          maximum: 30,
        },
      },
    },
  }, async (request, reply) => {
    const page = request.query.page;

    const noteList = await userListService.getUserList(page);

    return reply.send(noteList);
  });

  done();
};

export default UserListRouter;
