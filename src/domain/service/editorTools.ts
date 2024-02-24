import type EditorToolsRepository from '@repository/editorTools.repository.js';
import type EditorTool from '@domain/entities/editorTools.js';
import type EditorToolsServiceSharedMethods from './shared/editorTools.js';
import type User from '@domain/entities/user.js';
import type { EditorToolCreationAttributes } from '@domain/entities/editorTools.js';

/**
 * Editor tools service
 */
export default class EditorToolsService implements EditorToolsServiceSharedMethods {
  /**
   * User repository instance
   */
  private readonly repository: EditorToolsRepository;

  /**
   * Editor tools service constructor
   *
   * @param repository - user repository instance
   */
  constructor(repository: EditorToolsRepository) {
    this.repository = repository;
  }

  /**
   * @returns {Promise<EditorTool[] | null>} all available editor tools
   */
  public async getTools(): Promise<EditorTool[] | null> {
    return await this.repository.getTools();
  }

  /**
   *  Get bunch of editor tools by their ids
   *
   * @param editorToolIds - tool ids
   */
  public async getToolsByIds(editorToolIds: EditorTool['id'][]): Promise<EditorTool[]> {
    return await this.repository.getToolsByIds(editorToolIds);
  }

  /**
   * Get tool by it's identifier
   *
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
   *
   * @param editorTool - all data about the editor plugin
   * @param userId - user identifier
   * @returns {Promise<EditorTool>} editor tool data
   */
  public async addTool(editorTool: Omit<EditorToolCreationAttributes, 'author'>, userId?: User['id']): Promise<EditorTool> {
    return await this.repository.addTool({
      userId,
      ...editorTool,
    });
  }
}
