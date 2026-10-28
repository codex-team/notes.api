import type { FastifyInstance } from 'fastify';
import { StatusCodes } from 'http-status-codes';

/**
 * Error response of NoteX API passed to MCP client
 */
export class NotexApiError extends Error {
  /**
   * HTTP status code of the API response
   */
  public readonly statusCode: number;

  /**
   * Creates API error
   * @param statusCode - HTTP status code of the API response
   * @param message - error message from the API response
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Calls NoteX HTTP API on behalf of the MCP token owner.
 * Requests go through the same routes, policies and validation as requests from the web app
 */
export default class NotexApi {
  /**
   * Creates API client
   * @param server - fastify instance to inject requests into
   * @param accessToken - access token of the MCP token owner
   */
  constructor(private readonly server: FastifyInstance, private readonly accessToken: string) {}

  /**
   * Sends GET request
   * @param url - API route with query string
   */
  public async get<T>(url: string): Promise<T> {
    return await this.request<T>('GET', url);
  }

  /**
   * Sends POST request
   * @param url - API route
   * @param body - request body
   */
  public async post<T>(url: string, body: object): Promise<T> {
    return await this.request<T>('POST', url, body);
  }

  /**
   * Sends PATCH request
   * @param url - API route
   * @param body - request body
   */
  public async patch<T>(url: string, body: object): Promise<T> {
    return await this.request<T>('PATCH', url, body);
  }

  /**
   * Injects request into the API and returns parsed response body
   * @param method - HTTP method
   * @param url - API route
   * @param body - request body
   * @throws NotexApiError if API responded with an error
   */
  private async request<T>(method: 'GET' | 'POST' | 'PATCH', url: string, body?: object): Promise<T> {
    const response = await this.server.inject({
      method,
      url,
      headers: {
        authorization: `Bearer ${this.accessToken}`,
      },
      payload: body,
    });

    if (response.statusCode >= Number(StatusCodes.BAD_REQUEST)) {
      let message = `NoteX API responded with status ${response.statusCode}`;

      try {
        message = response.json<{ message?: string }>().message ?? message;
      } catch {
        /**
         * Response body is not JSON, keep the default message
         */
      }

      throw new NotexApiError(response.statusCode, message);
    }

    return response.json<T>();
  }
}
