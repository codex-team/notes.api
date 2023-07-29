import NoteService from '@domain/service/note.js';
import type { Repositories } from '@repository/index.js';
import AuthService from '@domain/service/auth.js';
import type { AppConfig } from '@infrastructure/config/index.js';
import UserService from '@domain/service/user.js';
import AIService from './service/ai.js';
import EditorToolsService from '@domain/service/editorTools.js';

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

  /**
   * User service instance
   */
  userService: UserService,

  /**
   * AI service instance
   */
  aiService: AIService
  editoToolsService: EditorToolsService,
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
    appConfig.auth.accessExpiresIn,
    appConfig.auth.refreshExpiresIn,
    repositories.userSessionRepository
  );

  const userService = new UserService(repositories.userRepository);

  const aiService = new AIService(repositories.aiRepository);
  const editoToolsService = new EditorToolsService(repositories.editorToolsRepository);

  return {
    noteService,
    userService,
    authService,
    aiService,
    editoToolsService,
  };
}
