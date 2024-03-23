import type { NoteInternalId } from '@domain/entities/note.js';
import type NoteView from '@domain/entities/noteView.js';
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
   * Updates existing noteView's vizitedAt or creates new record if user opens note for the first time
   *
   * @param noteId - note internal id
   * @param userId - id of the user
   * @returns updated or created NoteView
   */
  public async addOrUpdateNoteView(noteId: NoteInternalId, userId: User['id']): Promise<NoteView> {
    return await this.storage.addOrUpdateNoteView(noteId, userId);
  }
}