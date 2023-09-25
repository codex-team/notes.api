import { getLogger } from '@infrastructure/logging/index.js';
import type { HttpApiConfig } from '@infrastructure/config/index.js';
import fastify from 'fastify';
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

const appServerLogger = getLogger('appServer');

/**
 * Http server implementation
 */
export default class HttpServer implements Server {
  /**
   * Fastify server instance
   */
  public server = fastify({
    logger: appServerLogger,
  });

  /**
   * Middlewares
   */
  private readonly middlewares: Middlewares;

  /**
   * Creates http server instance
   *
   * @param config - http server config
   * @param domainServices - instances of domain services
   */
  constructor(
    private readonly config: HttpApiConfig,
    private readonly domainServices: DomainServices) {
    this.config = config;
    this.middlewares = initMiddlewares(domainServices);

    void this.addOpenapiDocs();
    void this.addCookies();
    void this.addOpenapiUI();
    void this.addApplicationAPI();
    void this.addOauth2();
    void this.addCORS();
    this.addSchema();
    this.add404Handling();
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

  /**
   * Registers openapi documentation
   */
  private async addOpenapiDocs(): Promise<void> {
    await this.server.register(fastifySwagger, {
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
   */
  private async addOpenapiUI(): Promise<void> {
    await this.server.register(fastifySwaggerUI, {
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
   */
  private async addCookies(): Promise<void> {
    await this.server.register(cookie, {
      secret: this.config.cookieSecret,
    });
  }

  /**
   * Registers all routers
   */
  private async addApplicationAPI(): Promise<void> {
    await this.server.register(NoteRouter, {
      prefix: '/note',
      noteService: this.domainServices.noteService,
      middlewares: this.middlewares,
    });

    await this.server.register(OauthRouter, {
      prefix: '/oauth',
      userService: this.domainServices.userService,
      authService: this.domainServices.authService,
      cookieDomain: this.config.cookieDomain,
    });

    await this.server.register(AuthRouter, {
      prefix: '/auth',
      authService: this.domainServices.authService,
    });

    await this.server.register(UserRouter, {
      prefix: '/user',
      userService: this.domainServices.userService,
      middlewares: this.middlewares,
    });

    await this.server.register(AIRouter, {
      prefix: '/ai',
      aiService: this.domainServices.aiService,
    });

    await this.server.register(EditorToolsRouter, {
      prefix: '/editor-tools',
      editorToolsService: this.domainServices.editorToolsService,
    });
  }

  /**
   * Registers oauth2 plugin
   */
  private async addOauth2(): Promise<void> {
    await this.server.register(fastifyOauth2, {
      name: 'googleOAuth2',
      scope: ['profile', 'email'],
      credentials: {
        client: {
          id: this.config.oauth2.google.clientId,
          secret: this.config.oauth2.google.clientSecret,
        },
        auth: fastifyOauth2.GOOGLE_CONFIGURATION,
      },
      startRedirectPath: this.config.oauth2.google.redirectUrl,
      callbackUri: this.config.oauth2.google.callbackUrl,
    });
  }

  /**
   * Allows cors for allowed origins from config
   */
  private async addCORS(): Promise<void> {
    await this.server.register(cors, {
      origin: this.config.allowedOrigins,
    });
  }

  /**
   * Add Fastify schema for validation and serialization
   */
  private addSchema(): void {
    this.server.addSchema(UserSchema);
  }

  /**
   * Custom method for sending 404 error
   */
  private add404Handling(): void {
    this.server.decorate('notFound', NotFoundDecorator);
  }
}
