import { getLogger } from '@infrastructure/logging/index.js';
import type { HttpApiConfig } from '@infrastructure/config/index.js';
import fastify from 'fastify';
import type API from '@presentation/api.interface.js';
import NoteRouter from '@presentation/http/router/note.js';
import type { DomainServices } from '@domain/index.js';
import cors from '@fastify/cors';
import fastifyOauth2 from '@fastify/oauth2';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import OauthRouter from '@presentation/http/router/oauth.js';
import initMiddlewares from '@presentation/http/middlewares/index.js';
import AuthRouter from '@presentation/http/router/auth.js';
import cookie from '@fastify/cookie';
import UserRouter from '@presentation/http/router/user.js';
import AIRouter from './router/ai.js';
import EditorToolsRouter from './router/editorTools.js';

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
    const middlewares = initMiddlewares(domainServices);

    /**
     * Register openapi documentation
     */
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

    await this.server.register(cookie, {
      secret: this.config.cookieSecret,
    });

    /**
     * Serve openapi UI and JSON scheme
     */
    await this.server.register(fastifySwaggerUI, {
      routePrefix: '/openapi',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
      transformSpecificationClone: true,
    });

    /**
     * Register all routers
     */
    await this.server.register(NoteRouter, {
      prefix: '/note',
      noteService: domainServices.noteService,
      middlewares: middlewares,
    });
    await this.server.register(OauthRouter, {
      prefix: '/oauth',
      userService: domainServices.userService,
      authService: domainServices.authService,
      cookieDomain: this.config.cookieDomain,
    });
    await this.server.register(AuthRouter, {
      prefix: '/auth',
      authService: domainServices.authService,
    });
    await this.server.register(UserRouter, {
      prefix: '/user',
      userService: domainServices.userService,
      middlewares: middlewares,
    });
    await this.server.register(AIRouter, {
      prefix: '/ai',
      aiService: domainServices.aiService,
    });
    await this.server.register(EditorToolsRouter, {
      prefix: '/editor-tools',
      editorToolsService: domainServices.editorToolsService,
    });


    /**
     * Register oauth2 plugin
     */
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

    /**
     * Allow cors for allowed origins from config
     */
    await this.server.register(cors, {
      origin: this.config.allowedOrigins,
    });

    await this.server.listen({
      host: this.config.host,
      port: this.config.port,
    });
  }
}
