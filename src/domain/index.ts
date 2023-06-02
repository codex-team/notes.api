import NoteService from '@domain/service/note.js';
import { Repositories } from '@repository/index.js';

/**
 * Interface for initiated services
 */
export interface DomainServices {
  /**
   * Note service instance
   */
  noteService: NoteService,
}

/**
 * Initiate services
 *
 * @param repositories - repositories
 */
export function init(repositories: Repositories): DomainServices {
  const noteService = new NoteService(repositories.noteRepository);

  return {
    noteService,
  };
}
