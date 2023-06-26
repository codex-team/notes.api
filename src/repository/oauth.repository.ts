import GoogleApi from '@repository/api/google.api.js';
import OAuthUser, { OAuthProvider } from '@domain/entities/oauthUser.js';

/**
 * Oauth repository
 */
export default class OauthRepository {
  /**
   * Google api
   */
  public googleApi: GoogleApi;

  /**
   * OauthRepository constructor
   *
   * @param googleApi - google api instance
   */
  constructor(googleApi: GoogleApi) {
    this.googleApi = googleApi;
  }

  /**
   * Gets user info
   *
   * @param { OAuthUser } oauthUser - oauth user
   */
  public async getUserInfo({ accessToken, provider }: OAuthUser): Promise<OAuthUser | undefined> {
    if (provider !== OAuthProvider.GOOGLE) {
      return;
    }

    const userInfo = await this.googleApi.getUserInfo(accessToken);

    return new OAuthUser(accessToken, provider, userInfo.email);
  }
}
