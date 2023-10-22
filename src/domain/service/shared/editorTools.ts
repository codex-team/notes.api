import type EditorTool from '@domain/entities/editorTools';

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
}
