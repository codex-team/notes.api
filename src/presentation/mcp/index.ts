import type { FastifyPluginCallback, FastifyReply } from 'fastify';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { StatusCodes } from 'http-status-codes';
import type McpToken from '@domain/entities/mcpToken.js';
import type McpTokenService from '@domain/service/mcpToken.js';
import type AuthService from '@domain/service/auth.js';
import { getRequestLogger } from '@infrastructure/logging/index.js';
import NotexApi from './notexApi.js';
import { createMcpServer } from './server.js';

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
 * Passes the resolved MCP token to the MCP server factory
 * @param token - plain MCP token from the request
 * @param mcpToken - resolved MCP token
 */
function toAuthInfo(token: string, mcpToken: McpToken): AuthInfo {
  return {
    token,
    clientId: String(mcpToken.id),
    scopes: [mcpToken.permission],
    extra: {
      mcpToken,
    },
  };
}

/**
 * Logs MCP errors that do not reach the client
 * @param error - error thrown while serving MCP request
 */
function logMcpError(error: Error): void {
  getRequestLogger('appServer').child({ router: 'mcp' })
    .error(error);
}

/**
 * MCP router plugin. Serves MCP over Streamable HTTP without sessions:
 * protocol revision 2026-07-28 and 2025-era clients on the same endpoint.
 * Every request creates its own MCP server for the owner of the passed MCP token
 * @param fastify - fastify instance
 * @param opts - router options
 * @param done - callback
 */
const McpRouter: FastifyPluginCallback<McpRouterOptions> = (fastify, opts, done) => {
  const { mcpTokenService, authService, webUrl } = opts;

  const handler = createMcpHandler(({ authInfo }) => {
    const mcpToken = authInfo?.extra?.mcpToken as McpToken | undefined;

    if (mcpToken === undefined) {
      throw new Error('MCP token is not resolved');
    }

    /**
     * Tools call API routes on behalf of the token owner
     */
    const api = new NotexApi(fastify, authService.signAccessToken({ id: mcpToken.userId }));

    return createMcpServer({
      api,
      webUrl,
      onToolCall: async () => await mcpTokenService.trackUsage(mcpToken.id),
    }, mcpToken.permission);
  }, {
    onerror: logMcpError,
  });

  const handleMcpRequest = toNodeHandler(handler, { onerror: logMcpError });

  fastify.addHook('onClose', async () => {
    await handler.close();
  });

  /**
   * Handle MCP JSON-RPC messages
   */
  fastify.post('/', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '') ?? '';
    const mcpToken = await mcpTokenService.resolveToken(token);

    if (mcpToken === null) {
      return await reply.unauthorized('Valid MCP token is required');
    }

    /**
     * MCP handler writes the response itself
     */
    void reply.hijack();

    /**
     * Hijacked reply does not flush headers set by hooks (e.g. CORS), so copy them to the raw response
     */
    for (const [name, value] of Object.entries(reply.getHeaders())) {
      if (value !== undefined) {
        reply.raw.setHeader(name, value);
      }
    }

    await handleMcpRequest(Object.assign(request.raw, { auth: toAuthInfo(token, mcpToken) }), reply.raw, request.body);
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
