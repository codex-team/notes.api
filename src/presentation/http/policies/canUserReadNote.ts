import type { FastifyReply, FastifyRequest } from 'fastify';
import hasProperty from '@infrastructure/utils/hasProperty.js';

/**
 * Policy to check if the user can edit a particular note
 *
 * @param ctx
 * @param request
 * @param reply
 */
export default function canUserEditNote(request: FastifyRequest, reply: FastifyReply): void {
  if (hasProperty(request.params, 'noteId')) {
    const { userId } = request;

    console.log('🦞🦞🦞🦞🦞 userId', userId);


  }
}
