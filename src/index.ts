import config from '@infrastructure/config/index.js';
import logger from '@infrastructure/logging/index.js';
import API from '@presentation/index.js';
import runMetricsServer from '@infrastructure/metrics/index.js';
import { init as initDomain } from '@domain/index.js';
import { initRepositories } from '@repository/index.js';

const api = new API(config.httpApi);

const start = async (): Promise<void> => {
  try {
    const repositories = await initRepositories(config.database);

    const domainServices = initDomain(repositories);

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
