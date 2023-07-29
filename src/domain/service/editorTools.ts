import type EditorToolsRepository from '@repository/editorTools.repository.js';
import { Provider } from '@repository/user.repository.js';
import type EditorTool from '@domain/entities/editorTool.js';

export {
  Provider
};

/**
 * User service
 */
export default class EditorToolsService {
  /**
   * User repository instance
   */
  private readonly repository: EditorToolsRepository;

  /**
   * User service constructor
   *
   * @param repository - user repository instance
   */
  constructor(repository: EditorToolsRepository) {
    this.repository = repository;
  }

  /**
   * @returns {Promise<EditorTool[] | null>} all available editor tools
   */
  public async getEditorTools(): Promise<EditorTool[] | null> {
    return await this.repository.getEditorTools();
  }

  /**
   * Adding custom editor tool
   *
   * @param editorTool - all data about the editor plugin
   * @returns {Promise<EditorTool | null>} editor tool data
   */
  public async addEditorTool(editorTool: EditorTool): Promise<EditorTool | null> {
    return await this.repository.addEditorTool(editorTool);
  }
}
