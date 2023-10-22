import type EditorToolsRepository from '@repository/editorTools.repository.js';
import type EditorTool from '@domain/entities/editorTools.js';
import { createEditorToolId } from '@infrastructure/utils/id.js';
import type EditorToolsServiceSharedMethods from './shared/editorTools.js';

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
   * Return tools that are available at Editor by default
   */
  public async getDefaultTools(): Promise<EditorTool[]> {
    return await this.repository.getDefaultTools();
  }

  /**
   * Adding custom editor tool
   *
   * @param editorTool - all data about the editor plugin
   * @returns {Promise<EditorTool>} editor tool data
   */
  public async addTool(editorTool: Omit<EditorTool, 'id'>): Promise<EditorTool> {
    return await this.repository.addTool({
      id: createEditorToolId(),
      ...editorTool,
    });
  }
}
