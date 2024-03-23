import type { NoteInternalId } from '@domain/entities/note.js';
import type NoteVisit from '@domain/entities/noteVisit.js';
import type User from '@domain/entities/user.js';
import type NoteVisitsStorage from '@repository/storage/noteVisits.storage.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class NoteViewsRepository {
  public storage: NoteVisitsStorage;

  /**
   * Note Views repository constructor
   *
   * @param storage - storage for note views
   */
  constructor(storage: NoteVisitsStorage) {
    this.storage = storage;
  }
  /**
   * Updates existing noteView's vizitedAt or creates new record if user opens note for the first time
   *
   * @param noteId - note internal id
   * @param userId - id of the user
   * @returns updated or created NoteView
   */
  public async saveVisit(noteId: NoteInternalId, userId: User['id']): Promise<NoteVisit> {
    return await this.storage.saveVisit(noteId, userId);
  }
}