import type { FastifyPluginCallback } from 'fastify';
import type McpTokenService from '@domain/service/mcpToken.js';
import type McpToken from '@domain/entities/mcpToken.js';
import type { McpTokenPermission, McpTokenPublic } from '@domain/entities/mcpToken.js';
import { definePublicMcpToken } from '@domain/entities/mcpToken.js';
import type { ErrorResponse } from '@presentation/http/types/HttpResponse.js';

/**
 * Interface for the MCP tokens router
 */
interface McpTokensRouterOptions {
  /**
   * MCP token service instance
   */
  mcpTokenService: McpTokenService;
}

/**
 * MCP tokens router plugin. Allows user to manage personal tokens for MCP clients
 * @param fastify - fastify instance
 * @param opts - router options
 * @param done - callback
 */
const McpTokensRouter: FastifyPluginCallback<McpTokensRouterOptions> = (fastify, opts, done) => {
  const { mcpTokenService } = opts;

  /**
   * Get all MCP tokens of the current user
   */
  fastify.get<{
    Reply: {
      items: McpTokenPublic[];
    };
  }>('/', {
    config: {
      policy: [
        'authRequired',
      ],
    },
    schema: {
      response: {
        '2xx': {
          type: 'object',
          description: 'MCP tokens of the current user',
          properties: {
            items: {
              type: 'array',
              items: {
                $ref: 'McpTokenSchema',
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.userId as number;

    const mcpTokens = await mcpTokenService.getTokensByUserId(userId);

    return reply.send({
      items: mcpTokens.map(definePublicMcpToken),
    });
  });

  /**
   * Create new MCP token. Plain token is returned only in this response
   */
  fastify.post<{
    Body: {
      label: string;
      permission: McpTokenPermission;
    };
    Reply: {
      token: string;
      item: McpTokenPublic;
    };
  }>('/', {
    config: {
      policy: [
        'authRequired',
      ],
    },
    schema: {
      body: {
        type: 'object',
        required: ['label', 'permission'],
        properties: {
          label: {
            $ref: 'McpTokenSchema#/properties/label',
          },
          permission: {
            $ref: 'McpTokenSchema#/properties/permission',
          },
        },
      },
      response: {
        '2xx': {
          type: 'object',
          description: 'Created MCP token',
          properties: {
            token: {
              type: 'string',
              description: 'Plain token. It is not stored and can not be shown again',
            },
            item: {
              $ref: 'McpTokenSchema',
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.userId as number;
    const { label, permission } = request.body;

    const { token, mcpToken } = await mcpTokenService.createToken(userId, label, permission);

    return reply.send({
      token,
      item: definePublicMcpToken(mcpToken),
    });
  });

  /**
   * Revoke MCP token of the current user
   */
  fastify.delete<{
    Params: {
      tokenId: McpToken['id'];
    };
    Reply: {
      isDeleted: boolean;
    } | ErrorResponse;
  }>('/:tokenId', {
    config: {
      policy: [
        'authRequired',
      ],
    },
    schema: {
      params: {
        tokenId: {
          $ref: 'McpTokenSchema#/properties/id',
        },
      },
      response: {
        '2xx': {
          type: 'object',
          properties: {
            isDeleted: {
              type: 'boolean',
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const userId = request.userId as number;

    const isDeleted = await mcpTokenService.revokeToken(userId, request.params.tokenId);

    if (!isDeleted) {
      return reply.notFound('Token not found');
    }

    return reply.send({ isDeleted });
  });

  done();
};

export default McpTokensRouter;
