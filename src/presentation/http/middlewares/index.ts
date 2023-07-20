import initAuth from '@presentation/http/middlewares/auth.js';
import { preHandlerHookHandler } from 'fastify';

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
 */
export default (): Middlewares => {
  /**
   * Init middlewares
   */
  const auth = initAuth();

  return {
    auth,
  };
};
