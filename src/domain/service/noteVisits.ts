import type { NoteInternalId } from '@domain/entities/note.js';
import type User from '@domain/entities/user.js';
import type NoteVisit from '@domain/entities/noteVisit.js';
import type NoteVisitsRepository from '@repository/noteVisits.repository.js';
import EventBus from '@domain/event-bus/index.js';
import { NOTE_ADDED_EVENT_NAME } from '@domain/event-bus/events/noteAddedEvent.js';
import { NOTE_VISITED_EVENT_NAME } from '@domain/event-bus/events/noteVisitedEvent.js';

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

    /**
     * Listen to the note related events
     */
    EventBus.getInstance().addEventListener(NOTE_ADDED_EVENT_NAME, async (event) => {
      const { noteId, userId } = (event as CustomEvent<{ noteId: number; userId: number }>).detail;

      try {
        return await this.noteVisitsRepository.saveVisit(noteId, userId);
      } catch (error) {
        throw error;
      }
    });

    EventBus.getInstance().addEventListener(NOTE_VISITED_EVENT_NAME, async (event) => {
      const { noteId, userId } = (event as CustomEvent<{ noteId: number; userId: number }>).detail;

      try {
        await this.noteVisitsRepository.saveVisit(noteId, userId);
      } catch (error) {
        console.error('Error saving note visit', error);
      }
    });
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

  /**
   * Deletes all visits of the note when a note is deleted
   *
   * @param noteId - note internal id
   */
  public async deleteNoteVisits(noteId: NoteInternalId): Promise<boolean> {
    return await this.noteVisitsRepository.deleteNoteVisits(noteId);
  }
}
