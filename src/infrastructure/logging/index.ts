import { pino } from 'pino';
import * as process from 'process';
import type { LoggingConfig } from '../config/index.js';
import appConfig from '../config/index.js';
import type { FastifyRequest } from 'fastify';
import { getCurrentReqId } from './reqId.context.js';

const loggerConfig = process.env['NODE_ENV'] === 'production'
  ? {}
  : {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    };

const rootLogger = pino(loggerConfig);

/**
 * Creates child logger and returns it.
 * @param moduleName - name of the module that is logging
 */
export function getLogger(moduleName: keyof LoggingConfig): pino.Logger {
  const childLogger = rootLogger.child({
    module: moduleName,
  });

  let logLevel = appConfig.logging[moduleName];

  if (typeof logLevel === 'boolean') {
    logLevel = logLevel ? 'info' : 'silent';
  }

  childLogger.level = logLevel;

  return childLogger;
}

/**
 * Creates a request-scoped logger that includes the request ID
 * @param moduleName - name of the module that is logging
 * @param request - Fastify request object containing reqId
 * @returns Logger instance with request ID context
 */
export function getRequestLogger(moduleName: keyof LoggingConfig, request?: FastifyRequest): pino.Logger {
  const baseLogger = getLogger(moduleName);
  const reqId = getCurrentReqId() ?? request?.id;

  if (reqId) {
    return baseLogger.child({
      reqId,
    });
  }

  return baseLogger;
}

const logger = getLogger('global');

export default logger;
