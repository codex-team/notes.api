/**
 * Fetch transport to make HTTP requests
 */
export default class FetchTransport {
  /**
   * Fetch constructor
   *
   * @param baseUrl - Base URL
   */
  constructor(private readonly baseUrl: string) {
  }

  /**
   * Make GET request
   *
   * @template Response - Response data type
   * @param endpoint - API endpoint
   * @param accessToken - Access token
   * @returns { Promise<Response> } - Response data
   */
  public async get<Response>(endpoint: string, accessToken: string): Promise<Response> {
    let headers;

    /**
     * If access token is provided, add it to headers
     */
    if (accessToken) {
      headers = {
        'Authorization': `Bearer ${accessToken}`,
      };
    }
    // eslint-disable-next-line no-undef
    const response = await fetch(this.baseUrl + endpoint, {
      method: 'GET',
      headers,
    });

    return await response.json() as Response;
  }
}
