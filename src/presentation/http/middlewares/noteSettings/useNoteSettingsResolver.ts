import type { preHandlerHookHandler } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { getLogger } from '@infrastructure/logging/index.js';
import type NoteSettingsService from '@domain/service/noteSettings.js';
import type NoteSettings from '@domain/entities/noteSettings';

/**
 * Add middleware for resolve Note settings and add it to request
 *
 * @param noteSettingsService - note settings domain service
 */
export default function useNoteSettingsResolver(noteSettingsService: NoteSettingsService): {
    /**
     * Resolve Note settings by note and add it to request
     *
     * Use this middleware as "preHandler" hook with a particular route
     */
    noteSettingsResolver: preHandlerHookHandler;
} {
  /**
   * Get logger instance
   */
  const logger = getLogger('appServer');

  return {
    noteSettingsResolver: async function noteSettingsResolver(request, reply) {
      let noteSettings: NoteSettings | null;

      try {
        if (!request.note) {
          throw new Error('Note was not resolved');
        }

        noteSettings = await noteSettingsService.getNoteSettingsByNoteId(request.note.id);

        request.noteSettings = noteSettings;
      } catch (error) {
        logger.error('Can not resolve Note settings by note');
        logger.error(error);

        await reply
          .code(StatusCodes.NOT_ACCEPTABLE)
          .send({
            message: 'Note settings not found',
          });
      }
    },
  };
}
