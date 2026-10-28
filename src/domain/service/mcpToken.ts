import { createHash } from 'crypto';
import { nanoid } from 'nanoid';
import type McpTokenRepository from '@repository/mcpToken.repository.js';
import type McpToken from '@domain/entities/mcpToken.js';
import type { McpTokenPermission } from '@domain/entities/mcpToken.js';
import { MCP_TOKEN_PREFIX } from '@domain/entities/mcpToken.js';
import type User from '@domain/entities/user.js';
import type { DomainLogger } from '@infrastructure/logging/domainLoggerInterface.js';

/**
 * MCP token service. Issues, revokes and resolves personal tokens used by MCP clients
 */
export default class McpTokenService {
  /**
   * MCP token repository instance
   */
  private readonly repository: McpTokenRepository;

  /**
   * Logger instance
   */
  private readonly logger: DomainLogger;

  /**
   * Length of the random part of the token
   */
  private readonly tokenSize = 32;

  /**
   * Number of last characters of the token shown to user as a preview
   */
  private readonly previewLength = 4;

  /**
   * MCP token service constructor
   * @param repository - MCP token repository
   * @param logger - domain logger
   */
  constructor(repository: McpTokenRepository, logger: DomainLogger) {
    this.repository = repository;
    this.logger = logger;
  }

  /**
   * Checks if passed string looks like MCP token
   * @param token - string to check
   */
  public static isMcpToken(token: string): boolean {
    return token.startsWith(MCP_TOKEN_PREFIX);
  }

  /**
   * Creates new MCP token. Plain token is returned only once and is not stored
   * @param userId - token owner id
   * @param label - label set by user
   * @param permission - what MCP client can do with notes of the token owner
   * @returns plain token and created token record
   */
  public async createToken(userId: User['id'], label: string, permission: McpTokenPermission): Promise<{ token: string; mcpToken: McpToken }> {
    const token = MCP_TOKEN_PREFIX + nanoid(this.tokenSize);

    const mcpToken = await this.repository.addToken({
      userId,
      tokenHash: this.hashToken(token),
      preview: token.slice(-this.previewLength),
      permission,
      label,
    });

    this.logger.info('MCP token created', {
      userId,
      tokenId: mcpToken.id,
      permission,
    });

    return {
      token,
      mcpToken,
    };
  }

  /**
   * Returns all MCP tokens of the user
   * @param userId - token owner id
   */
  public async getTokensByUserId(userId: User['id']): Promise<McpToken[]> {
    return await this.repository.getTokensByUserId(userId);
  }

  /**
   * Revokes MCP token. User can revoke only own tokens
   * @param userId - token owner id
   * @param tokenId - token id
   * @returns true if token was revoked
   */
  public async revokeToken(userId: User['id'], tokenId: McpToken['id']): Promise<boolean> {
    const isRevoked = await this.repository.removeToken(tokenId, userId);

    if (isRevoked) {
      this.logger.info('MCP token revoked', {
        userId,
        tokenId,
      });
    }

    return isRevoked;
  }

  /**
   * Finds MCP token record by plain token
   * @param token - plain token passed by MCP client
   * @returns token record or null if token is unknown
   */
  public async resolveToken(token: string): Promise<McpToken | null> {
    if (!McpTokenService.isMcpToken(token)) {
      return null;
    }

    return await this.repository.getTokenByHash(this.hashToken(token));
  }

  /**
   * Saves one more usage of the token
   * @param tokenId - token id
   */
  public async trackUsage(tokenId: McpToken['id']): Promise<void> {
    await this.repository.trackUsage(tokenId);
  }

  /**
   * Hashes token to store and search it in database
   * @param token - plain token
   */
  private hashToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }
}
