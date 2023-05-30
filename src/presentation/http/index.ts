import { getLogger } from '@infrastructure/logging/index.js';
import { HttpApiConfig } from '@infrastructure/config/index.js';
import fastify from 'fastify';
import { Server } from '../index.js';
import Router from '@presentation/http/router/router.js';

const appServerLogger = getLogger('appServer');

/**
 * Http server implementation
 */
export default class HttpServer implements Server {
  /**
   * Fastify server instance
   */
  private server = fastify({
    logger: appServerLogger,
  });

  /**
   * Router with all modules
   */
  private router = new Router('/');

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

    this.router.register(this.server);
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
