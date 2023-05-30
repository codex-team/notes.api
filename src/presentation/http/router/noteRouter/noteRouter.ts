import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import Router, { Actions, Route } from '@presentation/http/router/index.js';

/**
 * Class representing note router
 */
export default class NoteRouter implements Router {
  /**
   * Router prefix
   */
  public prefix: string;

  /**
   * Routes for note
   */
  public routes: Array<Route> = [];

  /**
   * Creates note router instance
   *
   * @param prefix - router prefix
   */
  constructor(prefix: string) {
    this.prefix = prefix;
    this.routes = [
      ['post', '/add', this.addNote]
    ];
  }

  /**
   * Function to add note
   *
   * @param request - request object
   * @param reply - reply object
   */
  public async addNote(request: FastifyRequest, reply: FastifyReply): Promise<void>  {
    reply.send( { data: request.query });
  }

  /**
   * Registers routes
   *
   * @param server - fastify server instance
   */
  public register(server: FastifyInstance): void {
    for (const route of this.routes) {
      /**
       * Create fastify server routes
       */
      server[route[0]](route[1], route[2]);
    }
  }
}