import jwt from 'jsonwebtoken';
import type AuthPayload from '@domain/entities/authPayload.js';
import { nanoid } from 'nanoid';
import UserSessionRepository from '@repository/userSession.repository.js';
import UserSession from '@domain/entities/userSession.js';

/**
 * Auth service
 */
export default class AuthService {
  /**
   * Access token secret key
   */
  private readonly accessSecret: string;

  /**
   * Access token expiration time
   */
  private readonly accessExpiresIn: number;

  /**
   * Refresh token expiration time
   */
  private readonly refreshExpiresIn: number;

  /**
   * User session repository instance, to manipulate user sessions in database
   */
  private readonly userSessionRepository: UserSessionRepository;

  /**
   * Creates jwt service instance
   *
   * @param accessSecret - access token secret key
   * @param accessTokenExpiresIn - access token expiration time
   * @param refreshTokenExpiresIn - refresh token expiration time
   * @param userSessionRepository - user session repository instance
   */
  constructor(accessSecret: string, accessTokenExpiresIn: number, refreshTokenExpiresIn: number, userSessionRepository: UserSessionRepository) {
    this.accessSecret = accessSecret;
    this.accessExpiresIn = accessTokenExpiresIn;
    this.refreshExpiresIn = refreshTokenExpiresIn;
    this.userSessionRepository = userSessionRepository;
  }

  /**
   * Generates access token
   *
   * @param payload - payload to sign
   * @returns {string} access token
   */
  public signAccessToken(payload: AuthPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
    });
  }

  /**
   * Verifies access token
   *
   * @param token - access token
   * @returns {AuthPayload} payload
   */
  public verifyAccessToken(token: string): AuthPayload {
    return jwt.verify(token, this.accessSecret, { complete: false }) as AuthPayload;
  }

  /**
   * Generates refresh token
   *
   * @param userId - user to sign refresh token for
   * @returns {Promise<string>} refresh token
   */
  public async signRefreshToken(userId: number): Promise<string> {
    const tokenSize = 10;

    /**
     * Generate refresh token
     */
    const token = nanoid(tokenSize);

    await this.userSessionRepository.addUserSession(userId, token, new Date(Date.now() + this.refreshExpiresIn));

    return token;
  }

  /**
   * Check if refresh token is valid
   *
   * @param token - refresh token to check
   * @returns {Promise<UserSession | null>} user session if session is valid
   */
  public async verifyRefreshToken(token: string): Promise<UserSession | null> {
    const session = await this.userSessionRepository.getUserSessionByRefreshToken(token);

    /**
     * If session is not found return null
     */
    if (!session) {
      return null;
    }

    /**
     * Check if refresh token is expired
     */
    if (session.refreshTokenExpiresAt.getTime() < Date.now()) {
      await this.userSessionRepository.removeUserSessionByRefreshToken(token);

      return null;
    }

    return session;
  }

  /**
   * Removes session by refresh token
   *
   * @param token - refresh token
   */
  public async removeSessionByRefreshToken(token: string): Promise<void> {
    await this.userSessionRepository.removeUserSessionByRefreshToken(token);
  }
}
