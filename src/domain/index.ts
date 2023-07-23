import NoteService from '@domain/service/note.js';
import { Repositories } from '@repository/index.js';
import UserSessionService from '@domain/service/userSession.js';

/**
 * Interface for initiated services
 */
export interface DomainServices {
  /**
   * Note service instance
   */
  noteService: NoteService,

  /**
   * User session service instance
   */
  userSessionService: UserSessionService,
}

/**
 * Initiate services
 *
 * @param repositories - repositories
 */
export function init(repositories: Repositories): DomainServices {
  const noteService = new NoteService(repositories.noteRepository);
  const userSessionService = new UserSessionService(repositories.userSessionRepository);

  return {
    noteService,
    userSessionService,
  };
}
