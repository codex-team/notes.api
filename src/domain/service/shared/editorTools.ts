import type EditorTool from '@domain/entities/editorTools.js';

/**
 * Which methods of Domain can be used by other domains
 * Uses to decouple domains from each other
 */
export default interface  EditorToolsServiceSharedMethods {
  /**
   * Return tools that are available at Editor by default
   */
  getDefaultTools(): Promise<EditorTool[]>;

  /**
   * Get bunch of editor tools by their ids
   *
   * @param ids - tool ids to resolve
   */
  getToolsByIds(ids: EditorTool['id'][]): Promise<EditorTool[]>;

  /**
   * Get tool by it's identifier
   *
   * @param id - unique tool identifier
   */
  getToolById(id: EditorTool['id']): Promise<EditorTool | null>;
}
