import AuthPayload from '@domain/entities/authPayload.js';

/**
 * Represents the HTTP request context with data, passed to the route handler from middlewares
 */
export interface HttpRequestContext {
  /**
   * Auth payload
   */
  auth: AuthPayload;
}
