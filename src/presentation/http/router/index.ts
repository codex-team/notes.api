import { FastifyInstance } from 'fastify';

/**
 * Interface representing router
 */
export default interface Router {
    /**
     * Server instance
     */
    server: FastifyInstance;

    /**
     * Router prefix
     */
    prefix: string;

    /**
     * Registers routes
     */
    register(): void;
}