/**
 * MCP token entity used for validation and serialization
 */
export const McpTokenSchema = {
  $id: 'McpTokenSchema',
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      description: 'Token id',
    },
    preview: {
      type: 'string',
      description: 'Last characters of the token',
    },
    permission: {
      type: 'string',
      enum: ['read', 'write'],
      description: 'What MCP client can do with notes of the token owner',
    },
    label: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      description: 'Label set by user, e.g. "Claude Code on laptop"',
    },
    lastUsedAt: {
      type: 'string',
      nullable: true,
      description: 'Last time token was used to call MCP tool',
    },
    requestCount: {
      type: 'integer',
      description: 'How many times token was used to call MCP tools',
    },
    createdAt: {
      type: 'string',
      description: 'When token was created',
    },
  },
};
