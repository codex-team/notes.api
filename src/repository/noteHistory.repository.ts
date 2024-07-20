import type { NoteHistoryCreationAttributes, NoteHistoryMeta, NoteHistoryRecord } from '@domain/entities/noteHistory.js';
import type NoteHistoryStorage from '@repository/storage/noteHistory.storage.js';

export default class NoteHistoryRepository {
  public storage: NoteHistoryStorage;

  constructor(storage: NoteHistoryStorage) {
    this.storage = storage;
  }

  public async createNoteHistoryRecord(noteHistory: NoteHistoryCreationAttributes): Promise<NoteHistoryRecord> {
    return await this.storage.createNoteHistoryRecord(noteHistory);
  }

  public async getNoteHistoryByNoteId(noteId: NoteHistoryRecord['noteId']): Promise<NoteHistoryMeta[]> {
    return await this.storage.getNoteHistoryByNoteId(noteId);
  }

  public async getHistoryRecordById(id: NoteHistoryRecord['id']): Promise<NoteHistoryRecord | null> {
    return await this.storage.getHistoryRecordById(id);
  }

  public async getLatestContent(noteId: NoteHistoryRecord['noteId']): Promise<NoteHistoryRecord['content'] | undefined> {
    return await this.storage.getLatestContent(noteId);
  }
}
