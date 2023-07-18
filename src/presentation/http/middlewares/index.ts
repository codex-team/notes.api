import auth from '@presentation/http/middlewares/auth.js';
import { preHandlerHookHandler } from 'fastify';

/**
 * Middlewares interface
 */
export interface Middlewares {
  /**
   * Auth middleware
   */
  authMiddleware: preHandlerHookHandler;
}

/**
 * Init middlewares
 *
 */
export default (): Middlewares => {
  /**
   * Init middlewares
   */
  const authMiddleware = auth();

  return {
    authMiddleware,
  };
};
