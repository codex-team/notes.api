import config from './infrastructure/config/index.js';
import logger from './infrastructure/logging/index.js';
import HttpServer from './presentation/http/index.js';


const httpServer = new HttpServer(config.httpApi);

const start = async (): Promise<void> => {
  try {
    await httpServer.run();
    logger.info('Application launched successfully');
  } catch (err) {
    logger.fatal('Failed to start application', err);
    process.exit(1);
  }
};

start();
