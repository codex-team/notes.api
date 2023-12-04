import NoteService from '@domain/service/note.js';
import NoteListService from '@domain/service/noteList.js';
import NoteSettingsService from './service/noteSettings.js';
import type { Repositories } from '@repository/index.js';
import AuthService from '@domain/service/auth.js';
import type { AppConfig } from '@infrastructure/config/index.js';
import UserService from '@domain/service/user.js';
import AIService from './service/ai.js';
import EditorToolsService from '@domain/service/editorTools.js';
import NoteRelationshipService from './service/noteRelationship.js';

/**
 * Interface for initiated services
 */
export interface DomainServices {
  /**
   * Note service instance
   */
  noteService: NoteService,

  /**
   * Note List service instance
   */
  noteListService: NoteListService,

  /**
   * Note settings service instance
   */
  noteSettingsService: NoteSettingsService,

  /**
   * Note relationship service instance
   */
  noteRelationshipService: NoteRelationshipService,

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
  const noteSettingsService = new NoteSettingsService(repositories.noteSettingsRepository, repositories.teamRepository);
  const noteListService = new NoteListService(repositories.noteRepository);
  const noteRelationshipService = new NoteRelationshipService(repositories.noteRelationshipRepository);

  const authService = new AuthService(
    appConfig.auth.accessSecret,
    appConfig.auth.accessExpiresIn,
    appConfig.auth.refreshExpiresIn,
    repositories.userSessionRepository
  );

  const editorToolsService = new EditorToolsService(repositories.editorToolsRepository);
  const userService = new UserService(repositories.userRepository, {
    editorTools: editorToolsService,
    /**
     * @todo find a way how to resolve circular dependency
     */
  });
  const aiService = new AIService(repositories.aiRepository);

  return {
    noteService,
    noteListService,
    noteSettingsService,
    noteRelationshipService,
    userService,
    authService,
    aiService,
    editorToolsService,
  };
}
