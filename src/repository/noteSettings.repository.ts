import type { Note, NotePublicId } from '@domain/entities/note.js';
import type NotesSettings from '@domain/entities/notesSettings.js';
import type NoteStorage from '@repository/storage/note.storage.js';
import type { NotesSettingsCreationAttributes } from '@domain/entities/notesSettings.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class NoteSettingsRepository {
  /**
   * Note Setting storage instance
   */
  public storage: NoteStorage;

  /**
   * Note Settings repository constructor
   *
   * @param storage - storage for note
   */
  constructor(storage: NoteStorage) {
    this.storage = storage;
  }

  /**
   * Gets note settings by id
   *
   * @param id - note id
   * @returns { Promise<NotesSettings | null> } - found note
   */
  public async getNoteSettingsById(id: NotesSettings['id']): Promise<NotesSettings | null> {
    return await this.storage.getNoteSettingsById(id);
  }

  /**
   * Get note settings by note id
   *
   * @param id - note public id
   * @returns { Promise<NotesSettings | null> } found note settings
   */
  public async getNoteSettingsByPublicId(id: NotePublicId): Promise<NotesSettings> {
    /**
     * @todo get internal id by public id and resolve note settings by the internal id
     */
    return await this.storage.getNoteSettingsByPublicId(id);
  }

  /**
   * Get note settings by note id
   *
   * @param id - note id
   * @returns { Promise<NotesSettings | null> } found note settings
   */
  public async getNoteSettingsByNoteId(id: Note['id']): Promise<NotesSettings> {
    return await this.storage.getNoteSettingsByNoteId(id);
  }

  /**
   * Add note settings
   *
   * @param settings - note settings
   */
  public async addNoteSettings(settings: NotesSettingsCreationAttributes): Promise<NotesSettings> {
    return await this.storage.insertNoteSettings(settings);
  }

  /**
   * Patch note settings
   *
   * @param data - note settings new values
   * @param id - note settings id
   * @returns { Promise<NotesSettings> } patched note settings
   */
  public async patchNoteSettings(data: Partial<NotesSettings>, id: NotesSettings['id']): Promise<NotesSettings | null> {
    return await this.storage.patchNoteSettings(data, id);
  }
}
