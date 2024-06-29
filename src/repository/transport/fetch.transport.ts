/**
 * Fetch transport to make HTTP requests
 */
export default class FetchTransport {
  /**
   * Fetch constructor
   * @param baseUrl - Base URL
   */
  constructor(private readonly baseUrl: string) {
  }

  /**
   * Make GET request
   * @template Response - Response data type
   * @param endpoint - API endpoint
   * @param headers - Request headers
   * @returns - Response data
   */
  public async get<Response>(endpoint: string, headers?: Record<string, string>): Promise<Response> {
    const response = await fetch(this.baseUrl + endpoint, {
      method: 'GET',
      headers,
    });

    return await response.json() as Response;
  }

  /**
   * Make POST request
   * @param endpoint - API endpoint
   * @param headers - request headers
   * @param data - request body data
   */
  public async post<Response>(endpoint: string, headers?: Record<string, string>, data?: FormData | string): Promise<Response> {
    const response = await fetch(this.baseUrl + endpoint, {
      method: 'POST',
      headers,
      body: data,
    });

    return await response.json() as Response;
  }
}
