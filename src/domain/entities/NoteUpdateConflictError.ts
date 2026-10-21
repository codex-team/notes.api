import { DomainError } from './DomainError.js';

/**
 * Thrown when the note was changed after the version the update is based on
 */
export class NoteUpdateConflictError extends DomainError {
  /**
   * @param message - description of the conflict
   */
  constructor(message = 'Note was changed after the expected version') {
    super(message);
  }
}
