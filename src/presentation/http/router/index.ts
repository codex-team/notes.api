import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Type for handler
 */
export type Handler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

/**
 * Actions for routes
 */
export enum Actions {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete'
}

/**
 * Type for route tuple (Method, path, handler)
 */
export type Route = ['post' | 'get' | 'delete' | 'put',`/${string}`, Handler];

/**
 * Interface representing router
 */
export default interface Router {
    /**
     * Routes
     */
    routes: Array<Route>;

    /**
     * Router prefix
     */
    prefix: string;

    /**
     * Registers routes
     */
    register(server: FastifyInstance): void;
}