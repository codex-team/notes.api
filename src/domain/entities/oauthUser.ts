export enum OAuthProvider {
  GOOGLE = 'google',
}

/**
 * OAuthUser entity
 */
export default class OAuthUser {
  /**
   * Access token
   */
  public accessToken: string;

  /**
   * User email address
   */
  public email: string;

  /**
   * OAuth provider
   */
  public provider: OAuthProvider;

  /**
   * OAuthUser constructor
   *
   * @param accessToken - access token
   * @param provider - oauth provider
   * @param email - user email address
   */
  constructor(accessToken: string, provider: OAuthProvider, email = '') {
    this.accessToken = accessToken;
    this.email = email;
    this.provider = provider;
  }
}
