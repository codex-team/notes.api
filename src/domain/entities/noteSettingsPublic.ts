import type NoteSettings from '@domain/entities/noteSettings.js';
import type { NotePublicId } from '@domain/entities/note.js';

export interface NoteSettingsPublic extends Omit<NoteSettings, 'noteId'> {
  /**
   * Expose note public id as the "noteId" property
   */
  noteId: NotePublicId;
}

/**
 *Create public note settings
 *
 * @param noteSettings - note settings data
 * @param notePublicId - note public id
 */
export function createPublicNoteSettings(noteSettings: NoteSettings, notePublicId: NotePublicId): NoteSettingsPublic {
  return {
    id: noteSettings.id,
    noteId: notePublicId,
    customHostname: noteSettings.customHostname,
    isPublic: noteSettings.isPublic,
    invitationHash: noteSettings.invitationHash,
  };
}
