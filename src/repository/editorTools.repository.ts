import type EditorToolsStorage from '@repository/storage/editorTools.storage.js';
import type EditorTool from '@domain/entities/editorTools.js';
import type { EditorToolCreationAttributes } from '@domain/entities/editorTools.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class EditorToolsRepository {
  public storage: EditorToolsStorage;

  /**
   * @param storage - repository storage
   */
  constructor(storage: EditorToolsStorage) {
    this.storage = storage;
  }

  /**
   * @param editorTool - all editor tool data
   */
  public async addTool(editorTool: EditorToolCreationAttributes): Promise<EditorTool> {
    const createdEditorTool = await this.storage.addTool(editorTool);

    return createdEditorTool;
  }

  /**
   * Get tool by it's identifier
   *
   * @param editorToolId - unique tool identifier
   */
  public async getToolById(editorToolId: EditorTool['id']): Promise<EditorTool | null> {
    return await this.storage.getToolById(editorToolId);
  }

  /**
   * Get bunch of tools by their ids
   *
   * @param editorToolIds - unique tool ids
   */
  public async getToolsByIds(editorToolIds: EditorTool['id'][]): Promise<EditorTool[]> {
    const tools = await this.storage.getToolsByIds(editorToolIds);

    return tools;
  }

  /**
   * Returns bunchh of tools by their names
   *
   * @param editorToolNames - unique tool names
   */
  public async getToolsByNames(editorToolNames: EditorTool['name'][]): Promise<EditorTool[]> {
    const tools = await this.storage.getToolsByNames(editorToolNames);

    return tools;
  }

  /**
   * Get all default tools
   */
  public async getDefaultTools(): Promise<EditorTool[]> {
    return await this.storage.getDefaultTools();
  }

  /**
   * Get all editor tools
   */
  public async getTools(): Promise<EditorTool[]> {
    const editorTools = await this.storage.getTools();

    return editorTools;
  }
}
