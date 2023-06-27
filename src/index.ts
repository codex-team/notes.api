import config from '@infrastructure/config/index.js';
import logger from '@infrastructure/logging/index.js';
import API from '@presentation/index.js';
import runMetricsServer from '@infrastructure/metrics/index.js';
import { init as initDomainServices } from '@domain/index.js';
import { init as initRepositories } from '@repository/index.js';

/**
 * Application entry point
 */
const start = async (): Promise<void> => {
  try {
    const api = new API(config.httpApi);
    const repositories = await initRepositories(config.database, config.google.apiUrl);
    const domainServices = initDomainServices(repositories);

    await api.run(domainServices);

    if (config.metrics.enabled) {
      await runMetricsServer();
    }

    logger.info('Application launched successfully');
  } catch (err) {
    logger.fatal('Failed to start application', err);
    process.exit(1);
  }
};

start();
