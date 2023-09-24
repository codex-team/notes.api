import type { FastifyPluginCallback } from 'fastify';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type { NotePublicId } from '@domain/entities/note.js';
import type NotesSettings from '@domain/entities/notesSettings.js';
import type { Middlewares } from '@presentation/http/middlewares/index.js';
import notEmpty from '@infrastructure/utils/notEmpty.js';

/**
 * Get note by id options
 */
interface GetNoteByIdOptions {
  /**
   * Note id
   */
  id: NotePublicId;
}

/**
 * Interface for the note settings router.
 */
interface NoteSettingsRouterOptions {
  /**
   * Note Settings service instance
   */
  noteSettingsService: NoteSettingsService,

  /**
   * Middlewares
   */
  middlewares: Middlewares,
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
   * Get note settings service from options
   */
  const noteSettingsService = opts.noteSettingsService;

  /**
   * Get noteSettings by id
   *
   * @todo move to the NoteSettings Router
   */
  fastify.get<{
    Params: GetNoteByIdOptions,
    Reply: NotesSettings
  }>('/:id/settings', async (request, reply) => {
    const params = request.params;
    /**
     * TODO: Validate request params
     */
    const { id } = params;

    const noteSettings = await noteSettingsService.getNoteSettingsByPublicId(id);

    /**
     * Check if note does not exist
     */
    if (!notEmpty(noteSettings)) {
      return fastify.notFound(reply, 'Note settings not found');
    }

    return reply.send(noteSettings);
  });

  /**
   * Patch noteSettings by note public id
   */
  fastify.patch<{
    Body: Partial<NotesSettings>,
    Params: GetNoteByIdOptions,
    Reply: NotesSettings,
  }>('/:id/settings', { preHandler: [opts.middlewares.authRequired, opts.middlewares.withUser] }, async (request, reply) => {
    const noteId = request.params.id;

    /**
     * TODO: check is user collaborator
     */

    const updatedNoteSettings = await noteSettingsService.patchNoteSettings(request.body, noteId);

    if (updatedNoteSettings === null) {
      return fastify.notFound(reply, 'Note settings not found');
    }

    return reply.send(updatedNoteSettings);
  });

  done();
};

export default NoteSettingsRouter;
