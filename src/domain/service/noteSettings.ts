import type { Note, NotePublicId } from '@domain/entities/note.js';
import type NotesSettings from '@domain/entities/notesSettings.js';
import type NoteSettingsRepository from '@repository/noteSettings.repository.js';

/**
 * Note service
 */
export default class NoteSettingsService {
  /**
   * Note Settings repository
   */
  public repository: NoteSettingsRepository;

  /**
   * Note Settings service constructor
   *
   * @param repository - note repository
   */
  constructor(repository: NoteSettingsRepository) {
    this.repository = repository;
  }

  /**
   * Gets note settings by public id
   *
   * @param id - note public id
   * @returns { Promise<NotesSettings | null> } note settings
   */
  public async getNoteSettingsByPublicId(id: NotePublicId): Promise<NotesSettings> {
    /**
     * @todo get internal id by public id and resolve note settings by the internal id
     */
    return await this.repository.getNoteSettingsByPublicId(id);
  }

  /**
   * Gets note settings by note id
   *
   * @param id - note id
   * @returns { Promise<NotesSettings | null> } note
   */
  public async getNoteSettingsByNoteId(id: Note['id']): Promise<NotesSettings | null> {
    return await this.repository.getNoteSettingsByNoteId(id);
  }

  /**
   * Adds note settings
   *
   * @param noteId - note id
   * @param enabled - is note enabled
   * @returns { Promise<NotesSettings> } note settings
   */
  public async addNoteSettings(noteId: Note['id'], enabled: boolean = true): Promise<NotesSettings> {
    return await this.repository.addNoteSettings({
      noteId: noteId,
      enabled: enabled,
    });
  }

  /**
   * Partially updates note settings
   *
   * @param data - note settings data with new values
   * @param noteId - note public id
   * @returns { Promise<NotesSettings> } updated note settings
   */
  public async patchNoteSettings(data: Partial<NotesSettings>, noteId: NotePublicId): Promise<NotesSettings | null> {
    const noteSettings = await this.repository.getNoteSettingsByPublicId(noteId);

    return await this.repository.patchNoteSettings(data, noteSettings.id);
  }
}
