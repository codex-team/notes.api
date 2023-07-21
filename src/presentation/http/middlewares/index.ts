import initAuth from '@presentation/http/middlewares/auth.js';
import { preHandlerHookHandler } from 'fastify';
import AuthService from '@domain/service/auth.js';

/**
 * Middlewares interface
 */
export interface Middlewares {
  /**
   * Auth middleware
   */
  auth: preHandlerHookHandler;
}

/**
 * Init middlewares
 *
 * @param authService - auth service instance
 * @returns { Middlewares } - middlewares
 */
export default (authService: AuthService): Middlewares => {
  /**
   * Init middlewares
   */
  const auth = initAuth(authService);

  return {
    auth,
  };
};
