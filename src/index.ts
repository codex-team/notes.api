import config from '@infrastructure/config/index.js';
import logger from '@infrastructure/logging/index.js';
import API from '@presentation/index.js';
import runMetricsServer from '@infrastructure/metrics/index.js';
import { init as initDomainServices } from '@domain/index.js';
import { initORM, init as initRepositories } from '@repository/index.js';
import process from 'process';
import SocketApi from '@presentation/sockets/socket-api.js';

/**
 * Application entry point
 */
const start = async (): Promise<void> => {
  try {
    const orm = await initORM(config.database);
    const repositories = await initRepositories(orm, config.s3);
    const domainServices = initDomainServices(repositories, config);
    const httpApi = new API(config.httpApi);
    const socketApi = new SocketApi(config.socketApi);

    await httpApi.init(domainServices);
    await httpApi.run();
    if (config.metrics.enabled) {
      await runMetricsServer();
    }

    logger.info('Application launched successfully');
  } catch (err) {
    logger.fatal('Failed to start application ' + (err as Error).toString());
    /* eslint-disable-next-line n/no-process-exit */
    process.exit(1);
  }
};

try {
  await start();
} catch (err) {
  logger.fatal('Failed to start application ' + (err as Error).toString());
  /* eslint-disable-next-line n/no-process-exit */
  process.exit(1);
}
