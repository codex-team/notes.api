import Transport from '@repository/transport/index.js';
import { ApiResponse } from '@repository/transport/google-api/types/ApiResponse.js';

/**
 * Google api transport
 */
export default class GoogleApiTransport extends Transport {
  /**
   * Constructor for Google api transport
   *
   * @param baseUrl - Base URL of Google api
   */
  constructor(baseUrl = 'https://www.googleapis.com/oauth2/v2') {
    super(baseUrl);
  }

  /**
   * Make GET request
   *
   * @template Payload - response payload type
   * @param endpoint - API endpoint
   * @param accessToken - access token for authorization to Google API
   * @returns { Promise<Payload> } - response payload
   */
  public async get<Payload>(endpoint: string, accessToken: string): Promise<Payload> {
    const res = await super.get<ApiResponse>(endpoint, accessToken);

    if ('error' in res) {
      /**
       * TODO: handle error, throw error
       */
    }

    return res as Payload;
  }
}
