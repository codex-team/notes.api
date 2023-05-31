import { getLogger } from '@infrastructure/logging/index.js';
import { HttpApiConfig } from '@infrastructure/config/index.js';
import fastify from 'fastify';
import type API from '@presentation/api.interface.js';
import NoteRouter from '@presentation/http/router/note.js';
import { DomainServices } from '@domain/service/index.js';

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
  }


  /**
   * Runs http server
   *
   * @param domainServices - instances of domain services
   */
  public async run(domainServices: DomainServices): Promise<void> {
    /**
     * Register all routers
     */
    this.server.register(NoteRouter, { prefix: '/note',
      noteService: domainServices.noteService });
    await this.server.listen({
      host: this.config.host,
      port: this.config.port,
    });
  }
}
