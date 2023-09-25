import { getLogger } from '@infrastructure/logging/index.js';
import type { HttpApiConfig } from '@infrastructure/config/index.js';
import fastify, { FastifyInstance } from 'fastify';
import type Server from '@presentation/server.interface.js';
import type { DomainServices } from '@domain/index.js';
import cors from '@fastify/cors';
import fastifyOauth2 from '@fastify/oauth2';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import initMiddlewares, { type Middlewares } from '@presentation/http/middlewares/index.js';
import cookie from '@fastify/cookie';
import NotFoundDecorator from './decorators/notFound.js';
import NoteRouter from '@presentation/http/router/note.js';
import OauthRouter from '@presentation/http/router/oauth.js';
import AuthRouter from '@presentation/http/router/auth.js';
import UserRouter from '@presentation/http/router/user.js';
import AIRouter from '@presentation/http/router/ai.js';
import EditorToolsRouter from './router/editorTools.js';
import { UserSchema } from './schema/User.js';
import type * as http from 'http';
import type { pino } from 'pino';

const appServerLogger = getLogger('appServer');

/**
 * Type shortcut for fastify server instance
 */
type FastifyServer = FastifyInstance<http.Server, http.IncomingMessage, http.ServerResponse, pino.Logger>;

/**
 * Http server implementation
 */
export default class HttpServer implements Server {
  /**
   * Fastify server instance
   */
  public server: FastifyServer | undefined;

  /**
   * Http server config
   */
  private config: HttpApiConfig | undefined;

  /**
   * Constructs http server
   * @param config - http server config 
   * @param domainServices - instances of domain services
   */
  public static async init(
    config: HttpApiConfig,
    domainServices: DomainServices,
  ): Promise<HttpServer> {
    const server = fastify({
      logger: appServerLogger,
    });
    const middlewares = initMiddlewares(domainServices);

    await HttpServer.addOpenapiDocs(server);
    await HttpServer.addCookies(server, config);
    await HttpServer.addOpenapiUI(server);
    await HttpServer.addAPI(server, config, domainServices, middlewares);
    await HttpServer.addOauth2(server, config);
    await HttpServer.addCORS(server, config);
    HttpServer.addSchema(server);
    HttpServer.add404Handling(server);

    const api = new HttpServer();

    api.server = server;
    api.config = config;

    return api;
  }

  /**
   * Runs http server
   */
  public async run(): Promise<void> {
      if (this.server === undefined || this.config === undefined) {
        throw new Error('Server is not initialized');
      }
      await this.server.listen({
        host: this.config.host,
        port: this.config.port,
      });
  }

  /**
   * Registers openapi documentation
   */
  private static async addOpenapiDocs(server: FastifyServer): Promise<void> {
    await server.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'NoteX openapi',
          description: 'Fastify REST API',
          version: '0.1.0',
        },
        servers: [ {
          url: 'http://localhost',
        } ],
      },
    });
  }

  /**
   * Serves openapi UI and JSON scheme
   * 
   * @param server - fastify server instance
   */
  private static async addOpenapiUI(server: FastifyServer): Promise<void> {
    await server.register(fastifySwaggerUI, {
      routePrefix: '/openapi',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
      transformSpecificationClone: true,
    });
  }

  /**
   * Adds support for reading and setting cookies
   * 
   * @param server - fastify server instance
   * @param config - http server config
   */
  private static async addCookies(server: FastifyServer, config: HttpApiConfig): Promise<void> {
    await server.register(cookie, {
      secret: config.cookieSecret,
    });
  }

  /**
   * Registers all routers
   * 
   * @param server - fastify server instance
   * @param config - http server config
   * @param domainServices - instances of domain services
   * @param middlewares - middlewares
   */
  private static async addAPI(server: FastifyServer, config: HttpApiConfig, domainServices: DomainServices, middlewares: Middlewares): Promise<void> {
    await server.register(NoteRouter, {
      prefix: '/note',
      noteService: domainServices.noteService,
      middlewares: middlewares,
    });

    await server.register(OauthRouter, {
      prefix: '/oauth',
      userService: domainServices.userService,
      authService: domainServices.authService,
      cookieDomain: config.cookieDomain,
    });

    await server.register(AuthRouter, {
      prefix: '/auth',
      authService: domainServices.authService,
    });

    await server.register(UserRouter, {
      prefix: '/user',
      userService: domainServices.userService,
      middlewares: middlewares,
    });

    await server.register(AIRouter, {
      prefix: '/ai',
      aiService: domainServices.aiService,
    });

    await server.register(EditorToolsRouter, {
      prefix: '/editor-tools',
      editorToolsService: domainServices.editorToolsService,
    });
  }

  /**
   * Registers oauth2 plugin
   * 
   * @param server - fastify server instance
   * @param config - http server config
   */
  private static async addOauth2(server: FastifyServer, config: HttpApiConfig): Promise<void> {
    await server.register(fastifyOauth2, {
      name: 'googleOAuth2',
      scope: ['profile', 'email'],
      credentials: {
        client: {
          id: config.oauth2.google.clientId,
          secret: config.oauth2.google.clientSecret,
        },
        auth: fastifyOauth2.GOOGLE_CONFIGURATION,
      },
      startRedirectPath: config.oauth2.google.redirectUrl,
      callbackUri: config.oauth2.google.callbackUrl,
    });
  }

  /**
   * Allows cors for allowed origins from config
   * 
   * @param server - fastify server instance
   * @param config - http server config
   */
  private static async addCORS(server: FastifyServer, config: HttpApiConfig): Promise<void> {
    await server.register(cors, {
      origin: config.allowedOrigins,
    });
  }

  /**
   * Add Fastify schema for validation and serialization
   * 
   * @param server - fastify server instance
   */
  private static addSchema(server: FastifyServer): void {
    server.addSchema(UserSchema);
  }

  /**
   * Custom method for sending 404 error
   * 
   * @param server - fastify server instance
   */
  private static add404Handling(server: FastifyServer): void {
    server.decorate('notFound', NotFoundDecorator);
  }
}
