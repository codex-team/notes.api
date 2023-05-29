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
 * Logging configuration
 */
const LoggingConfig = z.object({ // todo use this config to setup logging later
  global: z.string(), // todo use special type for log level
  metricsServer: z.string(),
  appServer: z.string(),
  database: z.string(),
});

/**
 * Http API configuration
 */
const HttpApiConfig = z.object({
  host: z.string(),
  port: z.number(),
});

/**
 * Application configuration
 */
const AppConfig = z.object({
  httpApi: HttpApiConfig,
  metrics: MetricsConfig,
  logging: LoggingConfig,
});

export type AppConfig = z.infer<typeof AppConfig>;

const defaultConfig: AppConfig = {
  httpApi: {
    host: '0.0.0.0',
    port: 3000,
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
