import config from '@infrastructure/config/index.js';
import logger from '@infrastructure/logging/index.js';
import API from '@presentation/index.js';
import runMetricsServer from '@infrastructure/metrics/index.js';
import { init as initDomainServices } from '@domain/index.js';
import { initORM, init as initRepositories } from '@repository/index.js';

/**
 * Application entry point
 */
const start = async (): Promise<void> => {
  try {
    const orm = await initORM(config.database);
    const repositories = await initRepositories(orm, config.s3);
    const domainServices = initDomainServices(repositories, config);
    const api = new API(config.httpApi);

    await api.init(domainServices);
    await api.run();

    if (config.metrics.enabled) {
      await runMetricsServer();
    }

    logger.info('Application launched successfully');
  } catch (err) {
    logger.fatal('Failed to start application ' + err);
    process.exit(1);
  }
};

try {
  await start();
} catch (err) {
  logger.fatal('Failed to start application ' + err);
  process.exit(1);
}

