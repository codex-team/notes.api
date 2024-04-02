import type { NoteInternalId } from '@domain/entities/note.js';
import type User from '@domain/entities/user.js';
import type NoteVisit from '@domain/entities/noteVisit.js';
import type NoteVisitsRepository from '@repository/noteVisits.repository.js';

/**
 * Note Visits service, which will store latest note visit
 * it is used to display recent notes for each user
 */
export default class NoteVisitsService {
  /**
   * Note Visits repository
   */
  public noteVisitsRepository: NoteVisitsRepository;

  /**
   * NoteVisits service constructor
   *
   * @param noteVisitRepository - note Visits repository
   */
  constructor(noteVisitRepository: NoteVisitsRepository) {
    this.noteVisitsRepository = noteVisitRepository;
  }

  /**
   * Updates existing noteVisit's visitedAt or creates new record if user opens note for the first time
   *
   * @param noteId - note internal id
   * @param userId - id of the user
   */
  public async saveVisit(noteId: NoteInternalId, userId: User['id']): Promise<NoteVisit> {
    return await this.noteVisitsRepository.saveVisit(noteId, userId);
  };
}