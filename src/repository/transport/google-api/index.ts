import Transport from '@repository/transport/index.js';
import type { ApiResponse } from '@repository/transport/google-api/types/ApiResponse.js';

/**
 * Google api transport
 */
export default class GoogleApiTransport extends Transport {
  /**
   * Constructor for Google api transport
   * @param baseUrl - Base URL of Google api
   */
  constructor(baseUrl = 'https://www.googleapis.com/oauth2/v2') {
    super(baseUrl);
  }

  /**
   * Make GET request with authorization to Google API
   * @param endpoint - API endpoint
   * @param accessToken - access token for authorization to Google API
   */
  public async getWithAccessToken<Payload>(endpoint: string, accessToken: string): Promise<Payload | null> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const res = await super.get<ApiResponse>(endpoint, headers);

    if ('error' in res) {
      /**
       * TODO: handle error, throw error
       */
      return null;
    }

    return res as Payload;
  }
}
