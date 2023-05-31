import { NoteService } from '@domain/service/index.js';

/**
 * API interface
 */
export default interface API {
  /**
   * Runs API module
   */
  run(noteService: NoteService): Promise<void>;
}
