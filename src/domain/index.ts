import NoteService from '@domain/service/note.js';
import { Repositories } from '@repository/index.js';
import UserService from '@domain/service/user.js';

/**
 * Interface for initiated services
 */
export interface DomainServices {
  /**
   * Note service instance
   */
  noteService: NoteService,

  /**
   * User service instance
   */
  userService: UserService,
}

/**
 * Initiate services
 *
 * @param repositories - repositories
 */
export function init(repositories: Repositories): DomainServices {
  const noteService = new NoteService(repositories.noteRepository);
  const userService = new UserService(repositories.userRepository);

  return {
    noteService,
    userService,
  };
}
