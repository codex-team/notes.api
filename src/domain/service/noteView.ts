import type { NoteInternalId } from '@domain/entities/note';
import type User from '@domain/entities/user.js';
import type NoteVisit from '@domain/entities/noteVisit.js';
import type NoteVisitsRepository from '@repository/noteVisits.repository';

/**
 * Note views service, which will store latest note visit
 * it is used to display recent notes for each user
 */
export default class NoteVisitsService {
  /**
   * Note views repository
   */
  public noteViewsRepository: NoteVisitsRepository;

  /**
   * NoteVeiws service constructor
   *
   * @param noteViewRepository - note views repository
   */
  constructor(noteViewRepository: NoteVisitsRepository) {
    this.noteViewsRepository = noteViewRepository;
  }

  /**
   * Updates existing noteView's vizitedAt or creates new record if user opens note for the first time
   *
   * @param noteId - note internal id
   * @param userId - id of the user
   */
  public async saveVisit(noteId: NoteInternalId, userId: User['id']): Promise<NoteVisit> {
    return await this.noteViewsRepository.saveVisit(noteId, userId);
  };
}