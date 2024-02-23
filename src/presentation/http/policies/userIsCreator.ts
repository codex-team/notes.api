import { isEmpty } from '@infrastructure/utils/empty.js';
import type { PolicyContext } from '@presentation/http/types/PolicyContext.js';


/**
 * Policy to check whether a user is a creator of the note
 *
 * @param context - Context object, containing Fatify request, Fastify reply and domain services
 */
export default async function userIsCreator(context: PolicyContext): Promise<void> {
  const { request, reply } = context;

  const { userId } = request;

  if (isEmpty(userId)) {
    return await reply.unauthorized();
  };

  /**
   * If note is not resolved, we can't check permissions
   */
  if (isEmpty(request.note)) {
    return await reply.notAcceptable('Note not found');
  };

  const { creatorId } = request.note;

  /**
   * Check if user is a creator of the note
   */
  if (creatorId !== userId) {
    return await reply.forbidden();
  }
}
