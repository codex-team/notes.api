import NoteService from '@domain/service/note.js';
import NoteSettingsService from './service/noteSettings.js';
import type { Repositories } from '@repository/index.js';
import AuthService from '@domain/service/auth.js';
import type { AppConfig } from '@infrastructure/config/index.js';
import UserService from '@domain/service/user.js';
import AIService from './service/ai.js';
import EditorToolsService from '@domain/service/editorTools.js';
import FileUploaderService from './service/fileUploader.service.js';
import NoteVisitsService from './service/noteVisits.js';
import { PinoDomainLoggerAdapter } from '@infrastructure/logging/pinoLoggerAdapter.js';

/**
 * Interface for initiated services
 */
export interface DomainServices {
  /**
   * Note service instance
   */
  noteService: NoteService;

  /**
   * Note settings service instance
   */
  noteSettingsService: NoteSettingsService;

  /**
   * Auth service instance
   */
  authService: AuthService;

  /**
   * User service instance
   */
  userService: UserService;

  /**
   * AI service instance
   */
  aiService: AIService;

  /**
   * Editor tools service instance
   */
  editorToolsService: EditorToolsService;

  /**
   * File uploader service instance
   */
  fileUploaderService: FileUploaderService;

  /**
   * Note visits service instance
   */
  noteVisitsService: NoteVisitsService;
}

/**
 * Initiate services
 * @param repositories - repositories
 * @param appConfig - app config
 */
export function init(repositories: Repositories, appConfig: AppConfig): DomainServices {
  /** Create a shared logger instance for all domain services */
  const domainLogger = new PinoDomainLoggerAdapter();

  /**
   * @todo use shared methods for uncoupling repositories unrelated to note service
   */
  const noteService = new NoteService(repositories.noteRepository, repositories.noteRelationsRepository, repositories.noteVisitsRepository, repositories.editorToolsRepository, repositories.noteHistoryRepository, domainLogger);
  const noteVisitsService = new NoteVisitsService(repositories.noteVisitsRepository, domainLogger);
  const authService = new AuthService(
    appConfig.auth.accessSecret,
    appConfig.auth.accessExpiresIn,
    appConfig.auth.refreshExpiresIn,
    repositories.userSessionRepository,
    domainLogger
  );
  const editorToolsService = new EditorToolsService(repositories.editorToolsRepository, domainLogger);
  const fileUploaderService = new FileUploaderService(repositories.objectStorageRepository, repositories.fileRepository, domainLogger);

  const sharedServices = {
    editorTools: editorToolsService,
    note: noteService,
    fileUploader: fileUploaderService,
    /**
     * @todo find a way how to resolve circular dependency
     */
  };

  const userService = new UserService(repositories.userRepository, sharedServices, domainLogger);
  const noteSettingsService = new NoteSettingsService(repositories.noteSettingsRepository, repositories.teamRepository, sharedServices, domainLogger);
  const aiService = new AIService(repositories.aiRepository);

  return {
    fileUploaderService,
    noteService,
    noteSettingsService,
    userService,
    authService,
    aiService,
    editorToolsService,
    noteVisitsService,
  };
}
