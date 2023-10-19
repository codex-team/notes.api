import { getLogger } from '@infrastructure/logging/index.js';
import type { HttpApiConfig } from '@infrastructure/config/index.js';
import type { FastifyInstance } from 'fastify';
import type { FastifyBaseLogger } from 'fastify';
import fastify from 'fastify';
import type Api from '@presentation/api.interface.js';
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
import type { RequestParams, Response } from '@presentation/api.interface.js';


const appServerLogger = getLogger('appServer');

/**
 * Http server implementation
 */
export default class HttpApi implements Api {
  /**
   * Fastify server instance
   */
  private server: FastifyInstance | undefined;

  /**
   * Http server config
   */
  private config: HttpApiConfig | undefined;

  /**
   * Initializes http server
   *
   * @param config - http server config
   * @param domainServices - instances of domain services
   */
  public async init(
    config: HttpApiConfig,
    domainServices: DomainServices
  ): Promise<void> {
    this.server = fastify({
      logger: appServerLogger as FastifyBaseLogger,
    });
    this.config = config;

    const middlewares = initMiddlewares(domainServices);

    await this.addOpenapiDocs();
    await this.addCookies(config);
    await this.addOpenapiUI();
    await this.addApiRoutes(config, domainServices, middlewares);
    await this.addOauth2(config);
    await this.addCORS(config);
    this.addSchema();
    this.addDecorators();
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
   * Performs fake request to API routes.
   * Used for API testing
   *
   * @param params - request options
   */
  public async fakeRequest(params: RequestParams): Promise<Response | undefined> {
    const response =  await this.server?.inject(params);

    if (response === undefined) {
      return;
    }

    return {
      statusCode: response.statusCode,
      body: response.body,
      headers: response.headers,
      json: response.json,
    };
  }

  /**
   * Registers openapi documentation
   *
   */
  private async addOpenapiDocs(): Promise<void> {
    await this.server?.register(fastifySwagger, {
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
    await this.server?.register(fastifySwaggerUI, {
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
   * @param config - http server config
   */
  private async addCookies(config: HttpApiConfig): Promise<void> {
    await this.server?.register(cookie, {
      secret: config.cookieSecret,
    });
  }

  /**
   * Registers all routers
   *
   * @param config - http server config
   * @param domainServices - instances of domain services
   * @param middlewares - middlewares
   */
  private async addApiRoutes(config: HttpApiConfig, domainServices: DomainServices, middlewares: Middlewares): Promise<void> {
    await this.server?.register(NoteRouter, {
      prefix: '/note',
      noteService: domainServices.noteService,
      middlewares: middlewares,
    });

    await this.server?.register(OauthRouter, {
      prefix: '/oauth',
      userService: domainServices.userService,
      authService: domainServices.authService,
      cookieDomain: config.cookieDomain,
    });

    await this.server?.register(AuthRouter, {
      prefix: '/auth',
      authService: domainServices.authService,
    });

    await this.server?.register(UserRouter, {
      prefix: '/user',
      userService: domainServices.userService,
      middlewares: middlewares,
    });

    await this.server?.register(AIRouter, {
      prefix: '/ai',
      aiService: domainServices.aiService,
    });

    await this.server?.register(EditorToolsRouter, {
      prefix: '/editor-tools',
      editorToolsService: domainServices.editorToolsService,
    });
  }

  /**
   * Registers oauth2 plugin
   *
   * @param config - http server config
   */
  private async addOauth2(config: HttpApiConfig): Promise<void> {
    await this.server?.register(fastifyOauth2, {
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
   * @param config - http server config
   */
  private async addCORS(config: HttpApiConfig): Promise<void> {
    await this.server?.register(cors, {
      origin: config.allowedOrigins,
    });
  }

  /**
   * Add Fastify schema for validation and serialization
   */
  private addSchema(): void {
    this.server?.addSchema(UserSchema);
  }

  /**
   * Add custom decorators
   */
  private addDecorators(): void {
    this.server?.decorate('notFound', NotFoundDecorator);
  }
}

