import jwt from 'jsonwebtoken';

/**
 * Jwt service
 */
export default class JwtService {
  /**
   * Secret key
   */
  private readonly secret: string;

  /**
   * Token expiration time
   */
  private readonly expiresIn: string = '24h';

  /**
   * Creates jwt service instance
   *
   * @param secret - secret to sign
   * @param expiresIn - token expiration time
   */
  constructor(secret: string, expiresIn?: string) {
    this.secret = secret;
    if (expiresIn) {
      this.expiresIn = expiresIn;
    }
  }

  /**
   * Generates access token
   *
   * @param payload - payload to sign
   * @returns {string} access token
   */
  public sign(payload: unknown): string {
    const strPayload = JSON.stringify(payload);

    return jwt.sign(strPayload, this.secret, {
      expiresIn: this.expiresIn,
    });
  }

  /**
   * Verifies access token
   *
   * @param token - access token
   * @returns {string | object} payload
   */
  public verify(token: string): string | object {
    return jwt.verify(token, this.secret);
  }
}
