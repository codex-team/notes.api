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
import Policies from './policies/index.js';
import type { RequestParams, Response } from '@presentation/api.interface.js';
import notEmpty from '@infrastructure/utils/notEmpty.js';


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
    await this.addCookies();
    await this.addOpenapiDocs();
    await this.addOpenapiUI();
    await this.addOauth2();
    await this.addCORS();

    this.addSchema();
    this.addDecorators(domainServices);
    this.addPolicyHook();
    const middlewares = initMiddlewares(domainServices);


    await this.addApiRoutes(domainServices, middlewares);
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
   * @param middlewares - middlewares
   */
  private async addApiRoutes(domainServices: DomainServices, middlewares: Middlewares): Promise<void> {
    await this.server?.register(NoteRouter, {
      prefix: '/note',
      noteService: domainServices.noteService,
      middlewares: middlewares,
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
  }

  /**
   * Add custom decorators
   *
   * @param domainServices
   */
  private addDecorators(domainServices: DomainServices): void {
    this.server?.decorate('notFound', NotFoundDecorator);

    this.server?.addHook('preHandler', (request, reply, done) => {
      const authorizationHeader = request.headers.authorization;

      if (notEmpty(authorizationHeader)) {
        const token = authorizationHeader.replace('Bearer ', '');

        try {
          request.userId = domainServices.authService.verifyAccessToken(token)['id'];
        } catch (error) {
          appServerLogger.error('Invalid Access Token');
          appServerLogger.error(error);
        }
      }
      done();
    });
    this.server?.decorateRequest('userId', null);
  }

  /**
   * Add "onRoute" hook that will check policies passed from route config
   */
  private addPolicyHook(): void {
    this.server?.addHook('onRoute', (routeOptions) => {
      const policies = routeOptions.config?.policy ?? [];

      if (policies.length === 0) {
        return;
      }

      if (routeOptions.preHandler === undefined) {
        routeOptions.preHandler = [];
      } else if (!Array.isArray(routeOptions.preHandler) ) {
        routeOptions.preHandler = [ routeOptions.preHandler ];
      }

      routeOptions.preHandler.push(async (request, reply) => {
        for (const policy of policies) {
          // const result = await Policies[policy](ctx);
          await Policies[policy](request, reply);

          // if (result === false) {
          //   return reply
          //     .code(401)
          //     .send({
          //       message: 'Permission denied',
          //     });
          // }
        }
      });
    });
  }
}

