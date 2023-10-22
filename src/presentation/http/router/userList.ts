
import type { FastifyPluginCallback } from 'fastify';
import type userListService  from '@domain/service/userListService';

interface UsersRouterOptions {

    userListService: userListService,
  }


const AllUsersRouter: FastifyPluginCallback<UsersRouterOptions> = (fastify, opts, done) => {
  const usersService = opts.userListService;

  fastify.get('/allUsers', {

  }, async (_, reply) => {
    const userList = await usersService.getAllUsers();

    return reply.send(userList);
  });

  done();
};

export default AllUsersRouter;