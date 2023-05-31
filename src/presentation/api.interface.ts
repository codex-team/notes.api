import { DomainServices } from '@domain/service/index.js';

/**
 * API interface
 */
export default interface API {
  /**
   * Runs API module
   */
  run(domainServices: DomainServices): Promise<void>;
}
