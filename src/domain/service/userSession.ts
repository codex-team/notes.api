import UserSessionsRepository from '@repository/userSession.repository.js';
import UserSession from '@domain/entities/userSession.js';

/**
 * User session service
 */
export default class UserSessionService {
  /**
   * User session repository
   */
  private readonly repository: UserSessionsRepository;

  /**
   * User session service constructor
   *
   * @param repository - user session repository
   */
  constructor(repository: UserSessionsRepository) {
    this.repository = repository;
  }

  /**
   * Adds user session
   *
   * @param userId - user id
   * @param refreshToken - refresh token
   * @param refreshTokenExpiresAt - refresh token expiration date
   */
  public async addUserSession(userId: number, refreshToken: string, refreshTokenExpiresAt: Date): Promise<UserSession> {
    return await this.repository.addUserSession(userId, refreshToken, refreshTokenExpiresAt);
  }

  /**
   * Gets user session by session id, checks is session correct
   *
   * @param sessionId - session id
   * @returns { Promise<UserSession | null> } found user session
   */
  public async getUserSessionBySessionId(sessionId: number): Promise<UserSession | null> {
    /**
     * TODO Add additional data to check is session correct
     */
    return await this.repository.getUserSessionBySessionId(sessionId);
  }

  /**
   * Removes user session by session id, can be used for logout
   *
   * @param sessionId - session id
   */
  public async removeUserSessionBySessionId(sessionId: number): Promise<void> {
    await this.repository.removeUserSessionBySessionId(sessionId);
  }
}
