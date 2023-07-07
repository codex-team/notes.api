import { getLogger } from '@infrastructure/logging/index.js';
import { HttpApiConfig, EnvironmentConfig } from '@infrastructure/config/index.js';
import fastify from 'fastify';
import type API from '@presentation/api.interface.js';
import NoteRouter from '@presentation/http/router/note.js';
import { DomainServices } from '@domain/index.js';
import JwtService from '@infrastructure/jwt/index.js';
import cors from '@fastify/cors';

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
   * Jwt service instance
   */
  private readonly jwtService: JwtService;

  /**
   * Environment
   */
  private readonly environment: EnvironmentConfig;

  /**
   * Creates http server instance
   *
   * @param config - http server config
   * @param environment - environment
   */
  constructor(config: HttpApiConfig, environment: EnvironmentConfig) {
    this.environment = environment;
    this.config = config;
    this.jwtService = new JwtService(this.config.accessTokenSecret, this.config.refreshTokenSecret);
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

    /**
     * Check if environment is development
     */
    if (this.environment === 'development') {
      /**
       * Allow all origins
       */
      this.server.register(cors, { origin: '*' });
    }

    await this.server.listen({
      host: this.config.host,
      port: this.config.port,
    });
  }
}
