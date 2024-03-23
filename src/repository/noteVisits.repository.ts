import type { NoteInternalId } from '@domain/entities/note.js';
import type NoteVisit from '@domain/entities/noteVisit.js';
import type User from '@domain/entities/user.js';
import type NoteVisitsStorage from '@repository/storage/noteVisits.storage.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class NoteVisitsRepository {
  public storage: NoteVisitsStorage;

  /**
   * Note Visits repository constructor
   *
   * @param storage - storage for note Visits
   */
  constructor(storage: NoteVisitsStorage) {
    this.storage = storage;
  }
  /**
   * Updates existing noteVisit's vizitedAt or creates new record if user opens note for the first time
   *
   * @param noteId - note internal id
   * @param userId - id of the user
   * @returns updated or created NoteVisit
   */
  public async saveVisit(noteId: NoteInternalId, userId: User['id']): Promise<NoteVisit> {
    return await this.storage.saveVisit(noteId, userId);
  }
}