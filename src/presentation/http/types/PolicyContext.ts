import type { DomainServices } from '@domain/index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Represents context provided for policies
 */
export interface PolicyContext {
  /**
   * Fastify request object
   */
  request: FastifyRequest;
  /**
   * Fastify reply object
   */
  reply: FastifyReply;
  /**
   * Instances of domain services
   */
  domainServices: DomainServices;
}
