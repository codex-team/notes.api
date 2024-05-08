import type AIService from '@domain/service/ai.js';
import type { FastifyPluginCallback } from 'fastify';

/**
 * Represents AI router options
 */
interface AIRouterOptions {
  /**
   * AI service instance
   */
  aiService: AIService;
}

/**
 * Get completion request params
 */
interface GetCompletionOptions {
  content: string;
}

/**
 * Ai Router plugin
 * @param fastify - fastify instance
 * @param opts - router options
 * @param done - done callback
 */
const AIRouter: FastifyPluginCallback<AIRouterOptions> = (fastify, opts, done) => {
  fastify.post('/complete', async (request, reply) => {
    const { content } = request.body as GetCompletionOptions;

    const result = await opts.aiService.getCompletion(content);

    return reply.send({ result });
  });

  done();
};

export default AIRouter;
