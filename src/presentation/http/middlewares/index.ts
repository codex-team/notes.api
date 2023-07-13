import AuthService from '@domain/service/auth.js';
import auth from '@presentation/http/middlewares/auth.js';
import { preHandlerHookHandler } from 'fastify';

/**
 * Middlewares interface
 */
interface Middlewares {
  /**
   * Auth middleware
   */
  authMiddleware: preHandlerHookHandler;
}

/**
 * Init middlewares
 *
 * @param authService - auth service instance
 */
export default (authService: AuthService): Middlewares => {
  /**
   * Init middlewares
   */
  const authMiddleware = auth(authService);

  return {
    authMiddleware,
  };
};
