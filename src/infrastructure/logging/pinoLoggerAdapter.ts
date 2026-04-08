import type pino from 'pino';
import type { DomainLogger } from '@domain/service/shared/logger.js';
import { getRequestLogger } from '@infrastructure/logging/index.js';

/**
 * Adapter that wraps a pino.Logger to implement the DomainLogger interface
 * This allows the infrastructure's pino logger to be injected into domain services
 * without the domain layer depending directly on pino
 */
export class PinoDomainLoggerAdapter implements DomainLogger {
  public debug(msg: string, meta?: Record<string, unknown>): void {
    this.getReqLogger().debug({
      msg,
      ...meta,
    });
  }

  public info(msg: string, meta?: Record<string, unknown>): void {
    this.getReqLogger().info({
      msg,
      ...meta,
    });
  }

  public warn(msg: string, meta?: Record<string, unknown>): void {
    this.getReqLogger().warn({
      msg,
      ...meta,
    });
  }

  private getReqLogger(): pino.Logger {
    return getRequestLogger('domain');
  }
}
