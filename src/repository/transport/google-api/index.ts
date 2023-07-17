import Transport from '@repository/transport/index.js';

/**
 * Google api transport
 */
export default class GoogleApiTransport extends Transport {
  /**
   * Constructor for Google api transport
   *
   * @param baseUrl - Base URL
   */
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  /**
   * Make GET request
   *
   * @template Payload - response payload type
   * @param endpoint - API endpoint
   * @param accessToken - Access token
   * @returns { Promise<Payload | null> } - response payload
   */
  public async get<Payload>(endpoint: string, accessToken: string): Promise<Payload> {
    const response = await super.get<Payload>(endpoint, accessToken);

    return response;
  }
}
