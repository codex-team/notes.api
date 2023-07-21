import jwt from 'jsonwebtoken';

/**
 * Payload interface
 */
export interface AuthPayload {
  /**
   * User id
   */
  id: number;
}

/**
 * Auth service
 */
export default class AuthService {
  /**
   * Access token secret key
   */
  private readonly accessSecret: string;

  /**
   * Refresh token secret key
   */
  private readonly refreshSecret: string;

  /**
   * Access token expiration time
   */
  private readonly accessExpiresIn: string = '24h';

  /**
   * Refresh token expiration time
   */
  private readonly refreshExpiresIn: string = '7d';

  /**
   * Creates jwt service instance
   *
   * @param accessSecret - access token secret key
   * @param refreshSecret - refresh token secret key
   * @param accessTokenExpiresIn - access token expiration time
   * @param refreshTokenExpiresIn - refresh token expiration time
   */
  constructor(accessSecret: string, refreshSecret: string, accessTokenExpiresIn?: string, refreshTokenExpiresIn?: string) {
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;

    /**
     * If expiration time is provided, use it
     */
    if (accessTokenExpiresIn) {
      this.accessExpiresIn = accessTokenExpiresIn;
    }
    if (refreshTokenExpiresIn) {
      this.refreshExpiresIn = refreshTokenExpiresIn;
    }
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
   * @param payload - payload to sign
   * @returns {string} refresh token
   */
  public signRefreshToken(payload: AuthPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    });
  }

  /**
   * Verifies refresh token
   *
   * @param token - refresh token
   * @returns {AuthPayload} payload
   */
  public verifyRefreshToken(token: string): AuthPayload {
    return jwt.verify(token, this.refreshSecret, { complete: false }) as AuthPayload;
  }
}
