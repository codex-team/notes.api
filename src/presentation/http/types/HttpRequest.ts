/**
 * Represents the HTTP request context with data, passed to the route handler from middlewares
 */
export interface HttpRequestContext<AuthPayload> {
  /**
   * Auth payload
   */
  auth: AuthPayload;
}
