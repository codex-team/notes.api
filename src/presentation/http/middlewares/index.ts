import initAuth from '@presentation/http/middlewares/authRequired.js';
import type { preHandlerHookHandler } from 'fastify';
import type { DomainServices } from '@domain/index.js';

/**
 * Middlewares interface
 */
export interface Middlewares {
  /**
   * Middleware for private routes
   */
  authRequired: preHandlerHookHandler;

  /**
   * Middleware for routes that should have user data
   */
  withUser: preHandlerHookHandler;
}

/**
 * Init middlewares
 *
 * @param services - domain services
 * @returns { Middlewares } - middlewares
 */
export default (services: DomainServices): Middlewares => {
  /**
   * Init middlewares
   */
  const authRequired = initAuth(services.authService);
  const withUser = initAuth(services.authService);

  return {
    authRequired,
    withUser,
  };
};
