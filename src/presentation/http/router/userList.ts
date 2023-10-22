
import type { FastifyPluginCallback } from 'fastify';
import type userListService  from '@domain/service/userListService';

interface UsersRouterOptions {

    userListService: userListService,
  }

/**
 * User list router plugin
 *
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const AllUsersRouter: FastifyPluginCallback<UsersRouterOptions> = (fastify, opts, done) => {
  const usersService = opts.userListService;
  /**
   * Get all users
   */
  fastify.get('/allUsers', {

  }, async (_, reply) => {
    const userList = await usersService.getAllUsers();

    return reply.send(userList);
  });

  done();
};

export default AllUsersRouter;