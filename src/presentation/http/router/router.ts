import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import NoteRouter from '@presentation/http/router/noteRouter/noteRouter.js';
import Router, { Route } from '@presentation/http/router/index.js';

/**
 * Class representing router
 */
export default class RootRouter implements Router {
  /**
   * Router prefix
   */
  public prefix: string;

  /**
   * Routes (Action, path, handler)
   */
  public routes: Array<Route> = [];

  /**
   * Note router
   */
  public noteRouter: NoteRouter;

  /**
   * Creates router instance
   *
   * @param prefix - router prefix
   */
  constructor(prefix: string) {
    this.prefix = prefix;
    this.routes = [
      ['get', '/', this.index],
    ];
    this.noteRouter = new NoteRouter('/note');
  }

  /**
   * Root route
   *
   * @param request - request object
   * @param reply - reply object
   */
  public async index(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.send({ hello: 'world' });
  }

  /**
   * Registers routes
   *
   * @param server - fastify server instance
   */
  public register(server: FastifyInstance): void {
    for (const route of this.routes) {
      server[route[0]](route[1], route[2]);
    }

    /**
     * Register note router
     */
    this.noteRouter.register(server);
  }
}