import type { NoteInternalId } from '@domain/entities/note.js';
import type NoteSettings from '@domain/entities/noteSettings.js';
import type NoteSettingsStorage from '@repository/storage/noteSettings.storage.js';
import type { NoteSettingsCreationAttributes } from '@domain/entities/noteSettings.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class NoteSettingsRepository {
  /**
   * Note Setting storage instance
   */
  public storage: NoteSettingsStorage;

  /**
   * Note Settings repository constructor
   *
   * @param storage - storage for note
   */
  constructor(storage: NoteSettingsStorage) {
    this.storage = storage;
  }

  /**
   * Gets note settings by id
   *
   * @param id - note id
   * @returns found note
   */
  public async getNoteSettingsById(id: NoteSettings['id']): Promise<NoteSettings | null> {
    return await this.storage.getNoteSettingsById(id);
  }

  /**
   * Get note settings by note id
   *
   * @param id - note id
   * @returns found note settings
   */
  public async getNoteSettingsByNoteId(id: NoteInternalId): Promise<NoteSettings> {
    return await this.storage.getNoteSettingsByNoteId(id);
  }

  /**
   * Add note settings
   *
   * @param settings - note settings
   */
  public async addNoteSettings(settings: NoteSettingsCreationAttributes): Promise<NoteSettings> {
    return await this.storage.insertNoteSettings(settings);
  }

  /**
   * Patch note settings
   *
   * @param id - note settings id
   * @param data - note settings new values
   * @returns patched note settings
   */
  public async patchNoteSettingsById(id: NoteSettings['id'], data: Partial<NoteSettings>): Promise<NoteSettings | null> {
    return await this.storage.patchNoteSettingsById(id, data);
  }
}
