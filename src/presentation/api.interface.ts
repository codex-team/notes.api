import type { DomainServices } from '@domain/index.js';

/**
 * API interface
 */
export default interface API {
  /**
   * Runs API module
   */
  run(domainServices: DomainServices): Promise<void>;
}
