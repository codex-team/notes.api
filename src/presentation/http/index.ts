import { getLogger } from '../../infrastructure/logging';
import fastify from 'fastify';
import { Server } from '../index';
import { HttpApiConfig } from '../../infrastructure/config';

const appServerLogger = getLogger('appServer');

/**
 * Http server implementation
 */
export default class HttpServer implements Server {
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

    this.server.get('/', async () => { // todo move to http/router folder
      return { hello: 'world' };
    });
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
