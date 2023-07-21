/**
 * Represents the HTTP request params with data, passed to the route handler from middlewares
 */
export interface HttpRequestParams<AuthPayload> {
  /**
   * Auth payload
   */
  auth: AuthPayload;
}
