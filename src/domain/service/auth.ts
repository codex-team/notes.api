import jwt from 'jsonwebtoken';
import AuthPayload from '@domain/entities/authPayload.js';
import { nanoid } from 'nanoid';

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
  private readonly accessExpiresIn: string | number;

  /**
   * Refresh token expiration time
   */
  private readonly refreshExpiresIn: string | number;

  /**
   * Creates jwt service instance
   *
   * @param accessSecret - access token secret key
   * @param accessTokenExpiresIn - access token expiration time
   * @param refreshTokenExpiresIn - refresh token expiration time
   */
  constructor(accessSecret: string, accessTokenExpiresIn: string | number, refreshTokenExpiresIn: string | number) {
    this.accessSecret = accessSecret;
    this.accessExpiresIn = accessTokenExpiresIn;
    this.refreshExpiresIn = refreshTokenExpiresIn;
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
   * @returns {string} refresh token
   */
  public signRefreshToken(): string {
    const tokenSize = 10;

    return nanoid(tokenSize);
  }
}
