import fastify from 'fastify';
import config from './infrastructure/config';
import logger, { getLogger } from './infrastructure/logging';

const appServerLogger = getLogger('appServer');

const server = fastify({
  logger: appServerLogger,
});

server.get('/', async () => {
  return { hello: 'world' };
});

const start = async (): Promise<void> => {
  try {
    await server.listen({ port: config.httpApi.port }); // todo move it to src/presentation as we agreed
    logger.info(`🚀 Server ready at http://${config.httpApi.host}:${config.httpApi.port}`);
  } catch (err) {
    logger.fatal('Failed to start server', err);
    process.exit(1);
  }
};

start();
