import jwt from 'jsonwebtoken';

/**
 * Jwt service
 */
export default class JwtService {
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
  public signAccessToken(payload: unknown): string {
    const strPayload = JSON.stringify(payload);

    return jwt.sign(strPayload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
    });
  }

  /**
   * Verifies access token
   *
   * @param token - access token
   * @returns {string | object} payload
   */
  public verifyAccessToken(token: string): string | object {
    return jwt.verify(token, this.accessSecret);
  }

  /**
   * Generates refresh token
   *
   * @param payload - payload to sign
   * @returns {string} refresh token
   */
  public signRefreshToken(payload: unknown): string {
    const strPayload = JSON.stringify(payload);

    return jwt.sign(strPayload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    });
  }

  /**
   * Verifies refresh token
   *
   * @param token - refresh token
   * @returns {string | object} payload
   */
  public verifyRefreshToken(token: string): string | object {
    return jwt.verify(token, this.refreshSecret);
  }
}
