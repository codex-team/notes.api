import type { NoteHistoryCreationAttributes, NoteHistoryMeta, NoteHistoryRecord } from '@domain/entities/noteHistory.js';
import type NoteHistoryStorage from '@repository/storage/noteHistory.storage.js';

/**
 * Note history repository used for data delivery from storage to service
 */
export default class NoteHistoryRepository {
  /**
   * Note history storage instance
   */
  public storage: NoteHistoryStorage;

  constructor(storage: NoteHistoryStorage) {
    this.storage = storage;
  }

  /**
   * Creates note hisotry record in storage
   * @param noteHistory - note history creation attributes
   * @returns - created note history record
   */
  public async createNoteHistoryRecord(noteHistory: NoteHistoryCreationAttributes): Promise<NoteHistoryRecord> {
    return await this.storage.createNoteHistoryRecord(noteHistory);
  }

  /**
   * Gets array of metadata of all saved note history records
   * @param noteId - id of the note, whose history we want to see
   * @returns array of metadata of the history records, used for informative presentation of history
   */
  public async getNoteHistoryByNoteId(noteId: NoteHistoryRecord['noteId']): Promise<NoteHistoryMeta[]> {
    return await this.storage.getNoteHistoryByNoteId(noteId);
  }

  /**
   * Get concrete history record by it's id
   * Used for presentation of certain version of note content saved in history
   * @param id - id of the history record
   * @returns full history record or null if there is no record with such an id
   */
  public async getHistoryRecordById(id: NoteHistoryRecord['id']): Promise<NoteHistoryRecord | null> {
    return await this.storage.getHistoryRecordById(id);
  }

  /**
   * Gets recent saved history record content
   * Used for service to check latest сhanges compared to the last saved record
   * @param noteId - id of the note, whose recent history record we want to see
   * @returns - latest saved content of the note
   */
  public async getLatestContent(noteId: NoteHistoryRecord['noteId']): Promise<NoteHistoryRecord['content'] | undefined> {
    return await this.storage.getLatestContent(noteId);
  }
}
