import NoteService from '@domain/service/note.js';
import { Repositories } from '@repository/index.js';
import AuthService from '@domain/service/auth.js';
import { AppConfig } from '@infrastructure/config/index.js';

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
 * @param appConfig - app config
 */
export function init(repositories: Repositories, appConfig: AppConfig): DomainServices {
  const noteService = new NoteService(repositories.noteRepository);
  const authService = new AuthService(
    appConfig.auth.accessSecret,
    appConfig.auth.refreshSecret,
    appConfig.auth.accessExpiresIn,
    appConfig.auth.refreshExpiresIn
  );

  return {
    noteService,
    authService,
  };
}
