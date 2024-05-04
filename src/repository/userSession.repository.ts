import type UserSessionsStorage from '@repository/storage/userSession.storage.js';
import type UserSession from '@domain/entities/userSession.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class UserSessionRepository {
  /**
   * User session storage instance
   */
  public storage: UserSessionsStorage;

  /**
   * User session repository constructor
   * @param storage - storage for user session
   */
  constructor(storage: UserSessionsStorage) {
    this.storage = storage;
  }

  /**
   * Add user session
   * @param userId - user id
   * @param refreshToken - refresh token
   * @param refreshTokenExpiresAt - refresh token expiration date
   * @returns added user session
   */
  public async addUserSession(userId: number, refreshToken: string, refreshTokenExpiresAt: Date): Promise<UserSession> {
    /**
     * TODO: Crypt refresh token
     */
    return await this.storage.create(userId, refreshToken, refreshTokenExpiresAt);
  }

  /**
   * Gets user session by refresh token
   * @param token - refresh token
   * @returns found user session
   */
  public async getUserSessionByRefreshToken(token: string): Promise<UserSession | null> {
    return await this.storage.findByToken(token);
  }

  /**
   * Removes user session by refresh token
   * @param refreshToken - refresh token
   * @returns
   */
  public async removeUserSessionByRefreshToken(refreshToken: string): Promise<void> {
    await this.storage.removeByRefreshToken(refreshToken);
  }
}
