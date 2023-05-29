import fastify from 'fastify';
import config from './infrastructure/config';

const server = fastify();

server.get('/', async () => {
  return { hello: 'world' };
});

const start = async (): Promise<void> => {
  try {
    await server.listen({ port: config.httpApi.port }); // todo move it to src/presentation as we agreed
    console.log(`Server listening on port ${config.httpApi.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
