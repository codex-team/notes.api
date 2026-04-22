import type pino from 'pino';
import type { DomainLogger } from '@infrastructure/logging/domainLoggerInterface.js';
import { getLogger } from '@infrastructure/logging/index.js';
import { getCurrentReqId } from '@infrastructure/logging/reqId.context.js';

/**
 * Adapter that wraps a pino.Logger to implement the DomainLogger interface
 * This allows the infrastructure's pino logger to be injected into domain services
 * without the domain layer depending directly on pino
 */
export class PinoDomainLoggerAdapter implements DomainLogger {
  private readonly baseLogger: pino.Logger;

  constructor() {
    this.baseLogger = getLogger('domain');
  }

  public debug(msg: string, meta?: Record<string, unknown>): void {
    const reqId = getCurrentReqId();

    this.baseLogger.debug({ ...meta,
      reqId }, msg);
  }

  public info(msg: string, meta?: Record<string, unknown>): void {
    const reqId = getCurrentReqId();

    this.baseLogger.info({ ...meta,
      reqId }, msg);
  }

  public warn(msg: string, meta?: Record<string, unknown>): void {
    const reqId = getCurrentReqId();

    this.baseLogger.warn({ ...meta,
      reqId }, msg);
  }
}
