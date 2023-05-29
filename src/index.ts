import config from './infrastructure/config';
import logger from './infrastructure/logging';
import HttpServer from './presentation/http';


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
