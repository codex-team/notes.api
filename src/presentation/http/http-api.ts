import { getLogger } from '@infrastructure/logging/index.js';
import type { HttpApiConfig } from '@infrastructure/config/index.js';
import type { FastifyInstance, FastifyBaseLogger } from 'fastify';
import fastify from 'fastify';
import type Api from '@presentation/api.interface.js';
import type { DomainServices } from '@domain/index.js';
import cors from '@fastify/cors';
import { fastifyOauth2 } from '@fastify/oauth2';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import addUserIdResolver from '@presentation/http/middlewares/common/userIdResolver.js';
import cookie from '@fastify/cookie';
import { notFound, forbidden, unauthorized, notAcceptable, domainError } from './decorators/index.js';
import NoteRouter from '@presentation/http/router/note.js';
import OauthRouter from '@presentation/http/router/oauth.js';
import AuthRouter from '@presentation/http/router/auth.js';
import UserRouter from '@presentation/http/router/user.js';
import AIRouter from '@presentation/http/router/ai.js';
import EditorToolsRouter from './router/editorTools.js';
import { UserSchema } from './schema/User.js';
import { NoteSchema } from './schema/Note.js';
import { NoteSettingsSchema } from './schema/NoteSettings.js';
import Policies from './policies/index.js';
import type { RequestParams, Response } from '@presentation/api.interface.js';
import NoteSettingsRouter from './router/noteSettings.js';
import NoteListRouter from '@presentation/http/router/noteList.js';
import { EditorToolSchema } from './schema/EditorTool.js';
import JoinRouter from '@presentation/http/router/join.js';
import { JoinSchemaParams, JoinSchemaResponse } from './schema/Join.js';
import { DomainError } from '@domain/entities/DomainError.js';
import UploadRouter from './router/upload.js';
import { ajvFilePlugin } from '@fastify/multipart';
import { UploadSchema } from './schema/Upload.js';


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
   * Constructs the instance
   *
   * @param config - http server config
   */
  constructor(private readonly config: HttpApiConfig) { }

  /**
   * Initializes http server
   *
   * @param domainServices - instances of domain services
   */
  public async init(domainServices: DomainServices): Promise<void> {
    this.server = fastify({
      logger: appServerLogger as FastifyBaseLogger,
      ajv: {
        plugins: [ 
          /** Allows to validate files in schema */
          ajvFilePlugin 
        ],
      },
    });

    /**
     * To guarantee consistent and predictable behavior,
     * it's highly recommended to always load plugins in order as shown below:
     *
     *   └── plugins (from the Fastify ecosystem)
     *   └── your plugins (your custom plugins)
     *   └── decorators
     *   └── hooks
     *   └── your services
     *
     * @see https://fastify.dev/docs/latest/Guides/Getting-Started#loading-order-of-your-plugins
     */
    this.domainErrorHandler();

    await this.addCookies();
    await this.addOpenapiDocs();
    await this.addOpenapiUI();
    await this.addOauth2();
    await this.addCORS();

    this.addCommonMiddlewares(domainServices);

    this.addSchema();
    this.addDecorators();

    this.addPoliciesCheckHook(domainServices);
    await this.addApiRoutes(domainServices);
  }


  /**
   * Runs http server
   */
  public async run(): Promise<void> {
    if (this.server === undefined) {
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
          url: 'http://localhost:1337',
          description: 'Localhost environment',
        }, {
          url: 'https://api.notex.so',
          description: 'Production environment',
        } ],
        components: {
          securitySchemes: {
            oAuthGoogle: {
              type: 'oauth2',
              description: 'Provied authorization uses OAuth 2 with Google',
              flows: {
                authorizationCode: {
                  authorizationUrl: 'https://api.notex.so/oauth/google/login',
                  scopes: {
                    'notesManagement': 'Create, read, update and delete notes',
                  },
                  tokenUrl: 'https://api.notex.so/oauth/google/callback',
                },
              },
            },
          },
        },
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
   */
  private async addCookies(): Promise<void> {
    await this.server?.register(cookie, {
      secret: this.config.cookieSecret,
    });
  }

  /**
   * Registers all routers
   *
   * @param domainServices - instances of domain services
   */
  private async addApiRoutes(domainServices: DomainServices): Promise<void> {
    await this.server?.register(NoteRouter, {
      prefix: '/note',
      noteService: domainServices.noteService,
      noteSettingsService: domainServices.noteSettingsService,
      noteVisitsService: domainServices.noteVisitsService,
    });

    await this.server?.register(NoteListRouter, {
      prefix: '/notes',
      noteService: domainServices.noteService,
    });

    await this.server?.register(JoinRouter, {
      prefix: '/join',
      noteSettings: domainServices.noteSettingsService,
    });

    await this.server?.register(NoteSettingsRouter, {
      prefix: '/note-settings',
      noteSettingsService: domainServices.noteSettingsService,
      noteService: domainServices.noteService,
    });

    await this.server?.register(OauthRouter, {
      prefix: '/oauth',
      userService: domainServices.userService,
      authService: domainServices.authService,
      cookieDomain: this.config.cookieDomain,
    });

    await this.server?.register(AuthRouter, {
      prefix: '/auth',
      authService: domainServices.authService,
    });

    await this.server?.register(UserRouter, {
      prefix: '/user',
      userService: domainServices.userService,
      editorToolsService: domainServices.editorToolsService,
    });

    await this.server?.register(AIRouter, {
      prefix: '/ai',
      aiService: domainServices.aiService,
    });

    await this.server?.register(EditorToolsRouter, {
      prefix: '/editor-tools',
      editorToolsService: domainServices.editorToolsService,
    });

    await this.server?.register(UploadRouter, {
      prefix: '/upload',
      fileUploaderService: domainServices.fileUploaderService,
      noteService: domainServices.noteService,
      fileSizeLimit: this.config.fileSizeLimit,
    });
  }

  /**
   * Registers oauth2 plugin
   *
   */
  private async addOauth2(): Promise<void> {
    await this.server?.register(fastifyOauth2, {
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
    await this.server?.register(cors, {
      origin: this.config.allowedOrigins,
    });
  }

  /**
   * Add Fastify schema for validation and serialization
   */
  private addSchema(): void {
    this.server?.addSchema(UserSchema);
    this.server?.addSchema(NoteSchema);
    this.server?.addSchema(EditorToolSchema);
    this.server?.addSchema(NoteSettingsSchema);
    this.server?.addSchema(JoinSchemaParams);
    this.server?.addSchema(JoinSchemaResponse);
    this.server?.addSchema(UploadSchema);
  }

  /**
   * Add custom decorators
   */
  private addDecorators(): void {
    this.server?.decorateReply('notFound', notFound);
    this.server?.decorateReply('forbidden', forbidden);
    this.server?.decorateReply('unauthorized', unauthorized);
    this.server?.decorateReply('notAcceptable', notAcceptable);
    this.server?.decorateReply('domainError', domainError);
  }

  /**
   * Add middlewares
   *
   * @param domainServices - instances of domain services
   */
  private addCommonMiddlewares(domainServices: DomainServices): void {
    if (this.server === undefined) {
      throw new Error('Server is not initialized');
    }

    addUserIdResolver(this.server, domainServices.authService, appServerLogger);
  }

  /**
   * Add "onRoute" hook that will add "preHandler" checking policies passed through the route config
   *
   * @param domainServices - instances of domain services
   */
  private addPoliciesCheckHook(domainServices: DomainServices): void {
    this.server?.addHook('onRoute', (routeOptions) => {
      const policies = routeOptions.config?.policy ?? [];

      if (policies.length === 0) {
        return;
      }

      /**
       * Save original route preHandler(s) if exists
       */
      if (routeOptions.preHandler === undefined) {
        routeOptions.preHandler = [];
      } else if (!Array.isArray(routeOptions.preHandler) ) {
        routeOptions.preHandler = [ routeOptions.preHandler ];
      }

      routeOptions.preHandler.push(async (request, reply) => {
        for (const policy of policies) {
          await Policies[policy]({
            request,
            reply,
            domainServices });
        }
      });
    });
  }

  /**
   * Domain error handler
   */
  private domainErrorHandler(): void {
    this.server?.setErrorHandler(function (error, request, reply) {
      /**
       * If we have an error that occurs in the domain-level we reply it with special format
       */
      if (error instanceof DomainError) {
        this.log.error(error);
        void reply.domainError(error.message);

        return;
      }
      /**
       * If error is not a domain error, we route it to the default error handler
       */
      throw error;
    });
  }
}
