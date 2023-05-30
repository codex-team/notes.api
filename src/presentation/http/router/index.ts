import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Type for handler
 */
export type Handler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

/**
 * Type for route tuple (Method, path, handler)
 */
export type Route = ['post' | 'get' | 'delete' | 'put', `/${string}`, Handler];

/**
 * Interface representing router
 */
export default interface Router {
    /**
     * Routes
     */
    routes: Route[];

    /**
     * Router prefix
     */
    prefix: string;

    /**
     * Registers routes
     */
    register(server: FastifyInstance): void;
}