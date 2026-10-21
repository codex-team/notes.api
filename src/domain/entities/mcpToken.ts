import type User from './user.js';

/**
 * Prefix of every MCP token. Allows to tell MCP tokens apart from access tokens
 */
export const MCP_TOKEN_PREFIX = 'ntx_';

/**
 * What MCP client can do with notes of the token owner
 */
export type McpTokenPermission = 'read' | 'write';

/**
 * Personal token used by MCP clients to access user notes
 */
export default interface McpToken {
  /**
   * Token id
   */
  id: number;

  /**
   * Token owner id
   */
  userId: User['id'];

  /**
   * Sha256 hash of the token. Token itself is not stored
   */
  tokenHash: string;

  /**
   * Last characters of the token, used to tell tokens apart in user settings
   */
  preview: string;

  /**
   * What MCP client can do with notes of the token owner
   */
  permission: McpTokenPermission;

  /**
   * Label set by user, e.g. "Claude Code on laptop"
   */
  label: string;

  /**
   * Last time token was used to call MCP tool
   */
  lastUsedAt: Date | null;

  /**
   * How many times token was used to call MCP tools
   */
  requestCount: number;

  /**
   * When token was created
   */
  createdAt: Date;
}

/**
 * Attributes required to create MCP token
 */
export type McpTokenCreationAttributes = Pick<McpToken, 'userId' | 'tokenHash' | 'preview' | 'permission' | 'label'>;

/**
 * MCP token without secret and owner fields, sent to user
 */
export type McpTokenPublic = Omit<McpToken, 'userId' | 'tokenHash'>;

/**
 * Change McpToken to McpTokenPublic
 * @param mcpToken - MCP token data to compose a public token
 */
export function definePublicMcpToken(mcpToken: McpToken): McpTokenPublic {
  return {
    id: mcpToken.id,
    preview: mcpToken.preview,
    permission: mcpToken.permission,
    label: mcpToken.label,
    lastUsedAt: mcpToken.lastUsedAt,
    requestCount: mcpToken.requestCount,
    createdAt: mcpToken.createdAt,
  };
}
