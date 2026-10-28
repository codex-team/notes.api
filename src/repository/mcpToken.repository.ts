import type McpTokenStorage from '@repository/storage/mcpToken.storage.js';
import type McpToken from '@domain/entities/mcpToken.js';
import type { McpTokenCreationAttributes } from '@domain/entities/mcpToken.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class McpTokenRepository {
  /**
   * MCP token storage instance
   */
  public storage: McpTokenStorage;

  /**
   * MCP token repository constructor
   * @param storage - storage for MCP tokens
   */
  constructor(storage: McpTokenStorage) {
    this.storage = storage;
  }

  /**
   * Adds MCP token
   * @param attributes - token owner, hash, preview, permission and label
   * @returns added MCP token
   */
  public async addToken(attributes: McpTokenCreationAttributes): Promise<McpToken> {
    return await this.storage.create(attributes);
  }

  /**
   * Gets all MCP tokens of the user
   * @param userId - token owner id
   * @returns list of MCP tokens
   */
  public async getTokensByUserId(userId: McpToken['userId']): Promise<McpToken[]> {
    return await this.storage.findByUserId(userId);
  }

  /**
   * Gets MCP token by its hash
   * @param tokenHash - sha256 hash of the token
   * @returns found MCP token
   */
  public async getTokenByHash(tokenHash: McpToken['tokenHash']): Promise<McpToken | null> {
    return await this.storage.findByTokenHash(tokenHash);
  }

  /**
   * Removes MCP token of the user
   * @param id - token id
   * @param userId - token owner id
   * @returns true if token was removed
   */
  public async removeToken(id: McpToken['id'], userId: McpToken['userId']): Promise<boolean> {
    return await this.storage.removeById(id, userId);
  }

  /**
   * Saves one more usage of the token
   * @param id - token id
   */
  public async trackUsage(id: McpToken['id']): Promise<void> {
    await this.storage.trackUsage(id);
  }
}
