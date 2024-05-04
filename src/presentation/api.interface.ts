import type { DomainServices } from '@domain/index.js';
import type * as http from 'http';

/**
 * API interface
 */
export default interface Api {

  /**
   * Initializes http server
   * @param domainServices - instances of domain services
   */
  init(domainServices: DomainServices): Promise<void>;

  /**
   * Runs API module
   */
  run(): Promise<void>;

  /**
   * Makes fake request to API.
   * Used for API testing
   * @param params - request params
   */
  fakeRequest(params: RequestParams): Promise<Response | undefined>;
}

/**
 * Fake request params
 */
export interface RequestParams {
  /**
   * Request method
   */
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';

  /**
   * Request url
   */
  url: string;

  /**
   * Request headers
   */
  headers?: http.IncomingHttpHeaders | http.OutgoingHttpHeaders;

  /**
   * Request body
   */

  body?: string | object | Buffer | NodeJS.ReadableStream;

  /**
   * Request cookies
   */
  cookies?: { [k: string]: string };
}

/**
 * Fake request response structure
 */
export interface Response {
  /**
   * Response status code
   */
  statusCode: number;

  /**
   * Response body
   */
  body: string;

  /**
   * Response headers
   */
  headers: http.OutgoingHttpHeaders;

  /**
   * Converts body to json
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  json: <T = any>() => T;
}
