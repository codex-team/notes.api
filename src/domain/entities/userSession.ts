/**
 * User session entity
 */
export default interface UserSession {
  /**
   * User session id
   */
  id: number;

  /**
   * User id
   */
  userId: number;

  /**
   * Refresh token
   */
  refreshToken: string;

  /**
   * Refresh token expiration date
   */
  refreshTokenExpiresAt: Date;
}
