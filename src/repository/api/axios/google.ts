import axios from 'axios';

interface UserInfo {
  email: string;
}

/**
 * GoogleAxios class
 */
export default class GoogleAxios {
  /**
   * Google api url
   */
  public url: string;

  /**
   * GoogleAxios constructor
   *
   * @param url - url to google api
   */
  constructor(url: string) {
    this.url = url;
  }

  /**
   * Gets user info
   *
   * @param accessToken - google api access token
   * @returns user info
   */
  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    const userInfoEndpoint = `${this.url}/userinfo`;

    const { data } = await axios.get(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data;
  }
}
