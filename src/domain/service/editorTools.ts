import type EditorToolsRepository from '@repository/editorTools.repository.js';
import type EditorTool from '@domain/entities/editorTools.js';
import type EditorToolsServiceSharedMethods from './shared/editorTools.js';
import type User from '@domain/entities/user.js';
import type { EditorToolCreationAttributes } from '@domain/entities/editorTools.js';
import type { DomainLogger } from '@infrastructure/logging/domainLoggerInterface.js';

/**
 * Editor tools service
 */
export default class EditorToolsService implements EditorToolsServiceSharedMethods {
  /**
   * User repository instance
   */
  private readonly repository: EditorToolsRepository;

  /**
   * Logger instance
   */
  private readonly logger: DomainLogger;

  /**
   * Editor tools service constructor
   * @param repository - user repository instance
   * @param logger - domain logger
   */
  constructor(repository: EditorToolsRepository, logger: DomainLogger) {
    this.repository = repository;
    this.logger = logger;
  }

  /**
   * @returns all available editor tools
   */
  public async getTools(): Promise<EditorTool[] | null> {
    return await this.repository.getTools();
  }

  /**
   *  Get bunch of editor tools by their ids
   * @param editorToolIds - tool ids
   */
  public async getToolsByIds(editorToolIds: EditorTool['id'][]): Promise<EditorTool[]> {
    return await this.repository.getToolsByIds(editorToolIds);
  }

  /**
   * Get tool by it's identifier
   * @param editorToolId - unique tool identifier
   */
  public async getToolById(editorToolId: EditorTool['id']): Promise<EditorTool | null> {
    return await this.repository.getToolById(editorToolId);
  }

  /**
   * Return tools that are available at Editor by default
   */
  public async getDefaultTools(): Promise<EditorTool[]> {
    return await this.repository.getDefaultTools();
  }

  /**
   * Adding custom editor tool
   * @param editorTool - all data about the editor plugin
   * @param userId - user identifier
   * @returns editor tool data
   */
  public async addTool(editorTool: Omit<EditorToolCreationAttributes, 'userId'>, userId: User['id']): Promise<EditorTool> {
    const createdTool = await this.repository.addTool({
      userId,
      ...editorTool,
    });

    this.logger.info('Editor tool created', {
      toolId: createdTool.id,
      userId,
    });

    return createdTool;
  }
}
