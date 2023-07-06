import { loadConfig } from '@codex-team/config-loader';
import * as process from 'process';
import arg from 'arg';
import path from 'path';
import { z } from 'zod';

/**
 * Metrics configuration
 */
const MetricsConfig = z.object({
  enabled: z.boolean(), // todo use this config to setup metrics server later
  host: z.string(),
  port: z.number(),
});

/**
 * Database configuration
 */
const DatabaseConfig = z.object({
  dsn: z.string(), // todo url or params
});

export type DatabaseConfig = z.infer<typeof DatabaseConfig>;

/**
 * Available logging levels configuration
 */
const LoggingLevel = z.union([
  z.boolean(), // disabled if false, 'info' if true
  z.literal('fatal'),
  z.literal('error'),
  z.literal('warn'),
  z.literal('info'),
  z.literal('debug'),
  z.literal('trace'),
  z.literal('silent'),
]);

/**
 * Logging configuration
 */
export const LoggingConfig = z.object({
  global: LoggingLevel,
  metricsServer: LoggingLevel,
  appServer: LoggingLevel,
  database: LoggingLevel,
});

export type LoggingConfig = z.infer<typeof LoggingConfig>;

/**
 * Http API configuration
 */
const HttpApiConfig = z.object({
  host: z.string(),
  port: z.number(),
  refreshTokenSecret: z.string(),
  accessTokenSecret: z.string(),
  environment: z.enum(['development', 'production']),
});

export type HttpApiConfig = z.infer<typeof HttpApiConfig>;

/**
 * Application configuration
 */
const AppConfig = z.object({
  httpApi: HttpApiConfig,
  metrics: MetricsConfig,
  logging: LoggingConfig,
  database: DatabaseConfig,
});

export type AppConfig = z.infer<typeof AppConfig>;

const defaultConfig: AppConfig = {
  httpApi: {
    host: '0.0.0.0',
    port: 3000,
    refreshTokenSecret: 'refreshTokenSecret',
    accessTokenSecret: 'accessTokenSecret',
    environment: 'development',
  },
  metrics: {
    enabled: true,
    host: '0.0.0.0',
    port: 9090,
  },
  logging: {
    global: 'info',
    metricsServer: 'info',
    appServer: 'info',
    database: 'info',
  },
  database: {
    dsn: 'postgres://user:pass@postgres/codex-notes',
  },
};

const args = arg({ /* eslint-disable @typescript-eslint/naming-convention */
  '--config': [ String ],
  '-c': '--config',
});

const cwd = process.cwd();
const paths = (args['--config'] || [ './app-config.yaml' ]).map((configPath) => {
  if (path.isAbsolute(configPath)) {
    return configPath;
  }

  return path.join(cwd, configPath);
});

const loadedConfig = loadConfig(...[defaultConfig, ...paths]);

const appConfig = AppConfig.parse(loadedConfig);

export default appConfig;
