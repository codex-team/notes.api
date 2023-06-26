import OauthRepository from '@repository/oauth.repository.js';
import OAuthUser, { OAuthProvider } from '@domain/entities/oauthUser.js';

/**
 * Get user info options
 */
export interface GetUserInfo {
  /**
   * OAuth provider
   */
  provider: OAuthProvider;

  /**
   * Access token
   */
  accessToken: string;
}

/**
 * Oauth service
 */
export default class OAuthService {
  /**
   * Oauth repository
   */
  public oauthRepository: OauthRepository;

  /**
   * Oauth service constructor
   *
   * @param oauthRepository - oauth repository
   */
  constructor(oauthRepository: OauthRepository) {
    this.oauthRepository = oauthRepository;
  }

  /**
   * Gets user info
   *
   * @param options - options
   * @returns { Promise<OAuthUser | undefined> } user info
   */
  public async getUserInfo({ provider, accessToken }: GetUserInfo): Promise<OAuthUser | undefined> {
    const oathUser = new OAuthUser(accessToken, provider);

    return await this.oauthRepository.getUserInfo(oathUser);
  }
}
