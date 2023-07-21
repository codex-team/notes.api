import NoteService from '@domain/service/note.js';
import { Repositories } from '@repository/index.js';
import AuthService from '@domain/service/auth.js';
import { AuthConfig } from '@infrastructure/config/index.js';

/**
 * Interface for initiated services
 */
export interface DomainServices {
  /**
   * Note service instance
   */
  noteService: NoteService,

  /**
   * Auth service instance
   */
  authService: AuthService,
}

/**
 * Initiate services
 *
 * @param repositories - repositories
 * @param authConfig - auth config
 */
export function init(repositories: Repositories, authConfig: AuthConfig): DomainServices {
  const noteService = new NoteService(repositories.noteRepository);
  const authService = new AuthService(authConfig.accessSecret, authConfig.refreshSecret, authConfig.accessExpiresIn, authConfig.refreshExpiresIn);

  return {
    noteService,
    authService,
  };
}
