import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Context for storing reqId within asynchronous operations
 */
interface RequestContext {
  reqId?: string;
}

/**
 * AsyncLocalStorage for storing request context
 * Allows tying database logs to the corresponding request
 */
export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Gets the current reqId from the execution context
 * @returns reqId or undefined if context is not set
 */
export function getCurrentReqId(): string | undefined {
  const context = requestContextStorage.getStore();

  return context?.reqId;
}
