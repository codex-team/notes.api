import { FastifyInstance } from 'fastify';
import NoteRouter from '@presentation/http/router/noteRouter/noteRouter.js';
import Router from '@presentation/http/router/index.js';

/**
 * Class representing router
 */
export default class RootRouter implements Router {
  /**
   * Router prefix
   */
  public prefix = '/';

  /**
   * Note router
   */
  public noteRouter: NoteRouter;

  /**
   * Server instance
   */
  public server: FastifyInstance;

  /**
   * Creates router instance
   *
   * @param server - server instance
   */
  constructor(server: FastifyInstance) {
    this.server = server;
    this.noteRouter = new NoteRouter(this.server, '/note');
  }

  /**
   * Root route
   *
   * @param path - path to index
   */
  public index(path: string): void {
    this.server.get(path, async () => {
      return { hello: 'world' };
    });
  }

  /**
   * Registers routes
   */
  public register(): void {
    this.index(this.prefix);
    this.noteRouter.register();
  }
}