import fastify from 'fastify';
import promClient from 'prom-client';
import { getLogger } from '@infrastructure/logging/index.js';
import config from '@infrastructure/config/index.js';
import { StatusCodes } from 'http-status-codes';
import process from 'process';

const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry;
const register = new Registry();

collectDefaultMetrics({ register });

const homePage = `
<!DOCTYPE html>
<html lang="en">
<body>
    <h1>Metrics and health</h1>
    <a href="/metrics">/metrics</a> <br>
    <a href="/health">/health</a> <br>
</body>
</html>
`;

/**
 * Creates and runs the metrics server.
 */
export default async function runMetricsServer(): Promise<void> {
  const metricsServerLogger = getLogger('metricsServer');
  const metricsServer = fastify({
    logger: metricsServerLogger,
  });

  metricsServer.get('/', (_request, reply) => {
    return reply
      .code(StatusCodes.OK)
      .type('text/html')
      .send(homePage);
  });

  metricsServer.get('/metrics', async (_request, reply) => {
    return reply
      .code(StatusCodes.OK)
      .send(await register.metrics());
  });

  metricsServer.get('/health', async (_request, reply) => {
    const data = {
      uptime: process.uptime(),
      message: 'ok',
      date: new Date(),
    };

    return reply
      .status(StatusCodes.OK)
      .send(data);
  });

  await metricsServer.listen({
    port: config.metrics.port,
    host: config.metrics.host,
  });
}
