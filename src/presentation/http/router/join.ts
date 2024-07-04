import type { FastifyPluginCallback } from 'fastify';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type { TeamMemberPublic } from '@domain/entities/team.js';

/**
 * Represents AI router options
 */
interface JoinRouterOptions {
  /**
   * Note settings service instance
   */
  noteSettings: NoteSettingsService;
}

/**
 * Join Router plugin
 * @todo use different replies for different errors in post route
 * @todo add check for write permission in route
 * @param fastify - fastify instance
 * @param opts - router options
 * @param done - done callback
 */
const JoinRouter: FastifyPluginCallback<JoinRouterOptions> = (fastify, opts, done) => {
  const noteSettingsService = opts.noteSettings;

  fastify.post<{
    Params: {
      hash: string;
    };
  }>('/:hash', {
    schema: {
      params: {
        hash: {
          $ref: 'JoinSchemaParams#/properties/hash',
        },
      },
      response: {
        '2xx': {
          description: 'Team member',
          content: {
            'application/json': {
              schema: {
                $ref: 'JoinSchemaResponse#/properties',
              },
            },
          },
        },
      },
    },
    config: {
      policy: [
        'authRequired',
      ],
    },
  }, async (request, reply) => {
    const { hash } = request.params;
    const { userId } = request;
    let result: TeamMemberPublic | null = null;

    try {
      result = await noteSettingsService.addUserToTeamByInvitationHash(hash, userId as number);
    } catch (error: unknown) {
      const causedError = error as Error;

      return reply.notAcceptable(causedError.message);
    }

    return reply.send({ result });
  });

  done();
};

export default JoinRouter;
