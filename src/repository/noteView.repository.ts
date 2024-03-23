import type { NoteInternalId } from '@domain/entities/note.js';
import type noteView from '@domain/entities/noteView.js';
import type User from '@domain/entities/user.js';
import type NoteViewsStorage from '@repository/storage/noteView.storage.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class NoteViewsRepository {
  public storage: NoteViewsStorage;

  /**
   * Note Views repository constructor
   *
   * @param storage - storage for note views
   */
  constructor(storage: NoteViewsStorage) {
    this.storage = storage;
  }
  /**
   *
   * @param noteId - note internal id
   * @param userId - id of the user
   */
  public async addOrUpdateNoteView(noteId: NoteInternalId, userId: User['id']): Promise<noteView | null> {
    return await this.storage.addOrUpdateNoteView(noteId, userId);
  }
}