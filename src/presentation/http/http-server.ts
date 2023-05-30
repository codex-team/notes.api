import { getLogger } from '@infrastructure/logging/index.js';
import { HttpApiConfig } from '@infrastructure/config/index.js';
import fastify from 'fastify';
import type API from '../api.interface.js';
import NoteRouter from '@presentation/http/router/note.js';

const appServerLogger = getLogger('appServer');

/**
 * Http server implementation
 */
export default class HttpServer implements API {
  /**
   * Fastify server instance
   */
  private server = fastify({
    logger: appServerLogger,
  });

  /**
   * Http server config
   */
  private readonly config: HttpApiConfig;

  /**
   * Creates http server instance
   *
   * @param config - http server config
   */
  constructor(config: HttpApiConfig) {
    this.config = config;

    /**
     * Register all routers
     */
    this.server.register(NoteRouter, { prefix: '/note' });
  }


  /**
   * Runs http server
   */
  public async run(): Promise<void> {
    await this.server.listen({
      host: this.config.host,
      port: this.config.port,
    });
  }
}
