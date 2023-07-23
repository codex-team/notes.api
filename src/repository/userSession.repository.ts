import UserSessionsStorage from '@repository/storage/userSession.storage';
import UserSession from '@domain/entities/userSession';

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
   *
   * @param storage - storage for user session
   */
  constructor(storage: UserSessionsStorage) {
    this.storage = storage;
  }

  /**
   * Add user session
   *
   * @param userId - user id
   * @param refreshToken - refresh token
   * @param refreshTokenExpiresAt - refresh token expiration date
   * @returns { Promise<UserSession> } added user session
   */
  public async addUserSession(userId: number, refreshToken: string, refreshTokenExpiresAt: Date): Promise<UserSession> {
    /**
     * TODO: Crypt refresh token
     */
    return await this.storage.create(userId, refreshToken, refreshTokenExpiresAt);
  }

  /**
   * Gets user session by session id
   *
   * @param sessionId - session id
   * @returns { Promise<UserSession | null> } found user session
   */
  public async getUserSessionBySessionId(sessionId: number): Promise<UserSession | null> {
    /**
     * TODO: Decrypt refresh token
     */
    return await this.storage.findById(sessionId);
  }

  /**
   * Removes user session by session id
   *
   * @param sessionId - session id
   * @returns { Promise<void> }
   */
  public async removeUserSessionBySessionId(sessionId: number): Promise<void> {
    await this.storage.removeById(sessionId);
  }
}
