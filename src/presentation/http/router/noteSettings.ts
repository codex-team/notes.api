import type { FastifyPluginCallback } from 'fastify';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type { NoteInternalId } from '@domain/entities/note.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import notEmpty from '@infrastructure/utils/notEmpty.js';
import useNoteResolver from '../middlewares/note/useNoteResolver.js';
import type NoteService from '@domain/service/note.js';
import { NotePublicId } from '@domain/entities/note.js';

/**
 * Interface for the note settings router.
 */
interface NoteSettingsRouterOptions {
  /**
   * Note Settings service instance
   */
  noteSettingsService: NoteSettingsService;

  /**
   * Note service instance
   */
  noteService: NoteService;
}

/**
 * Note Settings router plugin
 *
 * @param fastify - fastify instance
 * @param opts - empty options
 * @param done - callback
 */
const NoteSettingsRouter: FastifyPluginCallback<NoteSettingsRouterOptions> = (fastify, opts, done) => {
  /**
   * Get domain services from options
   */
  const noteSettingsService = opts.noteSettingsService;
  const noteService = opts.noteService;

  /**
   * Prepare note id resolver middleware
   * It should be used in routes that accepts note public id
   */
  const { noteIdResolver } = useNoteResolver(noteService);

  /**
   * Returns Note settings by note id. Note public id is passed in route params, and it converted to internal id via middleware
   */
  fastify.get<{
    Params: {
      notePublicId: NotePublicId;
    },
    Reply: NoteSettings
  }>('/:notePublicId', {
    preHandler: [
      noteIdResolver,
    ],
  }, async (request, reply) => {
    /**
     * TODO: Validate request params
     */
    const noteId = request.noteId as number;

    const noteSettings = await noteSettingsService.getNoteSettingsByNoteId(noteId);

    /**
     * Check if note does not exist
     */
    if (!notEmpty(noteSettings)) {
      return fastify.notFound(reply, 'Note settings not found');
    }

    return reply.send(noteSettings);
  });

  /**
   * Patch noteSettings by note id
   */
  fastify.patch<{
    Body: Partial<NoteSettings>,
    Params: {
      notePublicId: NotePublicId;
    },
    Reply: NoteSettings,
  }>('/:notePublicId', {
    config: {
      policy: [
        'authRequired',
      ],
    },
    preHandler: [
      noteIdResolver,
    ],
  }, async (request, reply) => {
    const noteId = request.noteId as number;

    /**
     * @todo validate data
     */
    const { customHostname, isPublic } = request.body;

    /**
     * TODO: check is user collaborator
     */

    const updatedNoteSettings = await noteSettingsService.patchNoteSettingsByNoteId(noteId, {
      customHostname,
      isPublic,
    });

    if (updatedNoteSettings === null) {
      return fastify.notFound(reply, 'Note settings not found');
    }

    return reply.send(updatedNoteSettings);
  });

  done();
};

export default NoteSettingsRouter;
