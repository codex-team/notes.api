
import type { FastifyPluginCallback } from 'fastify';
import userListService  from '@domain/service/userListService';
import { request } from 'http';

interface UsersRouterOptions {
    
    userListService: userListService,
  }

  
const AllUsersRouter: FastifyPluginCallback<UsersRouterOptions> = (fastify, opts, done) => {
    
    const usersService = opts.userListService;
    fastify.get('/allUsers', {
        
      }, async (request, reply) => {
        // const { userId } = request;
        const userList = await usersService.getAllUsersById();
        if (userList != null) {
          return reply.send(userList);
        } else {
            return reply.send({message: '!'})
        }
      });
    
      done();
    };
    export default AllUsersRouter;