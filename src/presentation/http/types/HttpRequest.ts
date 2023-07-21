/**
 * Represents the HTTP request config with data, passed to the route handler from middlewares
 */
export interface HttpRequestConfig<AuthPayload> {
  /**
   * Auth payload
   */
  auth: AuthPayload;
}
