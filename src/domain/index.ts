import NoteService from '@domain/service/note.js';
import { Repositories } from '@repository/index.js';
import UserService from '@domain/service/user.js';
import AuthService from '@domain/service/auth.js';
import { AuthConfig } from '@infrastructure/config';

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

  /**
   * Auth service instance
   */
  authService: AuthService,
}

/**
 * Initiate services
 *
 * @param repositories - repositories
 * @param config - auth config
 */
export function init(repositories: Repositories, config: AuthConfig): DomainServices {
  const noteService = new NoteService(repositories.noteRepository);
  const userService = new UserService(repositories.userRepository);
  const authService = new AuthService(config.accessTokenSecret, config.refreshTokenSecret);

  return {
    noteService,
    userService,
    authService,
  };
}
