import type EditorToolsRepository from '@repository/editorTools.repository.js';
import type EditorTool from '@domain/entities/editorTools.js';
import { createEditorToolId } from '@infrastructure/utils/id.js';

/**
 * Editor tools service
 */
export default class EditorToolsService {
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
  public async getToolsByIds(editorToolIds: EditorTool['id'][] ): Promise<EditorTool[] | null> {
    return await this.repository.getToolsByIds(editorToolIds);
  }

  /**
   * Adding custom editor tool
   *
   * @param editorTool - all data about the editor plugin
   * @returns {Promise<EditorTool | null>} editor tool data
   */
  public async addTool(editorTool: Omit<EditorTool, 'id'>): Promise<EditorTool | null> {
    return await this.repository.addTool({
      id: createEditorToolId(),
      ...editorTool,
    });
  }
}
