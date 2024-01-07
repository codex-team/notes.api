import type { FastifyPluginCallback } from 'fastify';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type { TeamMember } from '@domain/entities/team.js';

/**
 * Represents AI router options
 */
interface JoinRouterOptions {
  /**
   * Note settings service instance
   */
  noteSettings: NoteSettingsService
}

/**
 * Join Router plugin
 *
 * @param fastify - fastify instance
 * @param opts - router options
 * @param done - done callback
 */
const JoinRouter: FastifyPluginCallback<JoinRouterOptions> = (fastify, opts, done) => {
  const noteSettingsService = opts.noteSettings;

  fastify.post<{
    Params: {
      hash: string
    }
  }>('/:hash', {
    config: {
      policy: [
        'authRequired',
      ],
    },
  }, async (request, reply) => {
    const { hash } = request.params;
    const { userId } = request;
    let result: TeamMember | null = null;

    try {
      result = await noteSettingsService.addUserToTeamByInvitationHash(hash, userId as number);
    } catch (error: unknown) {
      const causedError = error as Error;

      /**
       * TODO use different replies for different errors
       */
      return reply.notAcceptable(causedError.message);
    }

    return reply.send({ result });
  });

  done();
};

export default JoinRouter;
