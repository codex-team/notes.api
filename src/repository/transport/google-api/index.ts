import Transport from '@repository/transport/index.js';

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
   * @param headers - Request headers
   * @returns { Promise<Payload> } - response payload
   */
  public async get<Payload>(endpoint: string, headers: Record<string, string>): Promise<Payload> {
    return await super.get<Payload>(endpoint, headers);
  }
}
