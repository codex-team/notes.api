import NoteService from '@domain/service/note.js';
import NoteSettingsService from './service/noteSettings.js';
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
   * Note settings service instance
   */
  noteSettingsService: NoteSettingsService,

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
  editorToolsService: EditorToolsService,
}

/**
 * Initiate services
 *
 * @param repositories - repositories
 * @param appConfig - app config
 */
export function init(repositories: Repositories, appConfig: AppConfig): DomainServices {
  const noteService = new NoteService(repositories.noteRepository);
  const noteSettingsService = new NoteSettingsService(repositories.noteSettingsRepository);

  const authService = new AuthService(
    appConfig.auth.accessSecret,
    appConfig.auth.accessExpiresIn,
    appConfig.auth.refreshExpiresIn,
    repositories.userSessionRepository
  );

  const userService = new UserService(repositories.userRepository);

  const aiService = new AIService(repositories.aiRepository);
  const editorToolsService = new EditorToolsService(repositories.editorToolsRepository);

  return {
    noteService,
    noteSettingsService,
    userService,
    authService,
    aiService,
    editorToolsService,
  };
}
