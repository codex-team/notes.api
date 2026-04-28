/**
 * Domain-level logger interface - abstract contract for logging business events
 * Implementations are provided by the infrastructure layer
 */

export interface DomainLogger {
  /**
   * Debug-level log
   * @param msg - log message
   * @param meta - optional structured metadata
   */
  debug(msg: string, meta?: Record<string, unknown>): void;

  /**
   * Info-level log
   * @param msg - log message
   * @param meta - optional structured metadata
   */
  info(msg: string, meta?: Record<string, unknown>): void;

  /**
   * Warn-level log
   * @param msg - log message
   * @param meta - optional structured metadata
   */
  warn(msg: string, meta?: Record<string, unknown>): void;

}
