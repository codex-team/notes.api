import type { NoteInternalId } from '@domain/entities/note.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import type NoteSettingsRepository from '@repository/noteSettings.repository.js';

/**
 * Service responsible for Note Settings
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
   * Returns settings for a note with passed id
   *
   * @param id - note internal id
   */
  public async getNoteSettingsByNoteId(id: NoteInternalId): Promise<NoteSettings> {
    return await this.repository.getNoteSettingsByNoteId(id);
  }

  /**
   * Adds note settings
   *
   * @param noteId - note id
   * @param isPublic - is note public
   * @returns added note settings
   */
  public async addNoteSettings(noteId: NoteInternalId, isPublic: boolean = true): Promise<NoteSettings> {
    return await this.repository.addNoteSettings({
      noteId: noteId,
      isPublic: isPublic,
    });
  }

  /**
   * Partially updates note settings
   *
   * @param noteId - note internal id
   * @param data - note settings data with new values
   * @returns updated note settings
   */
  public async patchNoteSettingsByNoteId(noteId: NoteInternalId, data: Partial<NoteSettings>): Promise<NoteSettings | null> {
    const noteSettings = await this.repository.getNoteSettingsByNoteId(noteId);

    return await this.repository.patchNoteSettingsById(noteSettings.id, data);
  }
}
