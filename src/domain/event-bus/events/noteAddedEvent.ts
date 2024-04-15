/**
 * Event that is emitted when a note is added.
 */
export const NOTE_ADDED_EVENT_NAME = 'noteAdded';


/**
 *  Note added event
 */
export class NoteAddedEvent extends CustomEvent<{ noteId: number; userId: number }> {
  /**
   *  Note added event constructor
   * @param noteId - note internal id
   * @param userId - user id
   */
  constructor(noteId: number, userId: number) {
    super(NOTE_ADDED_EVENT_NAME, {
      detail: { noteId,
        userId },
    });
  }
}
