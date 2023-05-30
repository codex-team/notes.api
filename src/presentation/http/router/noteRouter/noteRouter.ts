import { FastifyInstance } from 'fastify';
import Router from '@presentation/http/router/index.js';

/**
 * Class representing note router
 */
export default class NoteRouter implements Router {
  /**
   * Router prefix
   */
  public prefix: string;

  /**
   * Server instance
   */
  public server: FastifyInstance;

  /**
   * Creates note router instance
   *
   * @param server - server instance
   * @param prefix - router prefix
   */
  constructor(server: FastifyInstance, prefix: string) {
    this.prefix = prefix;
    this.server = server;
  }

  /**
   * Function to add note
   *
   * @param path - path to add note
   */
  public addNote(path: string): void  {
    this.server.post(path, async (request, reply) => {
      reply.send( { data: request.query });
    });
  }

  /**
   * Registers routes
   */
  public register(): void {
    this.addNote(this.prefix + '/add');
  }
}