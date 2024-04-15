// domain/event-bus/events/noteVisitedEvent.ts

export const NOTE_VISITED_EVENT_NAME = 'noteVisited';

/**
 *  Note visited event
 */
export class NoteVisitedEvent extends CustomEvent<{ noteId: number; userId: number }> {
  /**
   *  Note visited event constructor
   * @param noteId - note internal id
   * @param userId - user id
   */
  constructor(noteId: number, userId: number) {
    super(NOTE_VISITED_EVENT_NAME, { detail: { noteId,
      userId } });
  }
}
