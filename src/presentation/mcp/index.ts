import type { FastifyPluginCallback, FastifyReply } from 'fastify';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StatusCodes } from 'http-status-codes';
import type McpTokenService from '@domain/service/mcpToken.js';
import type AuthService from '@domain/service/auth.js';
import { getRequestLogger } from '@infrastructure/logging/index.js';
import NotexApi from './notexApi.js';
import { createMcpServer } from './server.js';

/**
 * JSON-RPC error code for internal server errors
 */
const JSON_RPC_INTERNAL_ERROR = -32603;

/**
 * Interface for the MCP router
 */
interface McpRouterOptions {
  /**
   * MCP token service instance
   */
  mcpTokenService: McpTokenService;

  /**
   * Auth service instance
   */
  authService: AuthService;

  /**
   * Web app url, used to build links to notes
   */
  webUrl: string;
}

/**
 * MCP router plugin. Serves MCP over Streamable HTTP in stateless mode:
 * every request creates its own MCP server for the owner of the passed MCP token
 * @param fastify - fastify instance
 * @param opts - router options
 * @param done - callback
 */
const McpRouter: FastifyPluginCallback<McpRouterOptions> = (fastify, opts, done) => {
  const { mcpTokenService, authService, webUrl } = opts;

  /**
   * Handle MCP JSON-RPC messages
   */
  fastify.post('/', async (request, reply) => {
    const logger = getRequestLogger('appServer').child({ router: 'mcp' });
    const token = request.headers.authorization?.replace('Bearer ', '') ?? '';
    const mcpToken = await mcpTokenService.resolveToken(token);

    if (mcpToken === null) {
      return await reply.unauthorized('Valid MCP token is required');
    }

    /**
     * Tools call API routes on behalf of the token owner
     */
    const api = new NotexApi(fastify, authService.signAccessToken({ id: mcpToken.userId }));

    const server = createMcpServer({
      api,
      webUrl,
      onToolCall: async () => await mcpTokenService.trackUsage(mcpToken.id),
    }, mcpToken.permission);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    /**
     * Transport writes the response itself
     */
    void reply.hijack();

    reply.raw.on('close', () => {
      void transport.close();
      void server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(request.raw, reply.raw, request.body);
    } catch (error) {
      logger.error(error);

      if (!reply.raw.headersSent) {
        reply.raw.setHeader('content-type', 'application/json');
        reply.raw.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
        reply.raw.end(JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: JSON_RPC_INTERNAL_ERROR,
            message: 'Internal server error',
          },
          id: null,
        }));
      }
    }
  });

  /**
   * Server does not open SSE streams and does not keep sessions
   * @param _request - fastify request
   * @param reply - fastify reply
   */
  const methodNotAllowed = async (_request: unknown, reply: FastifyReply): Promise<void> => {
    await reply
      .code(StatusCodes.METHOD_NOT_ALLOWED)
      .header('allow', 'POST')
      .send({ message: 'Method not allowed' });
  };

  fastify.get('/', methodNotAllowed);
  fastify.delete('/', methodNotAllowed);

  done();
};

export default McpRouter;
