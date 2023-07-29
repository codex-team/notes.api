/**
 * Plugin that connects to the editor based on user settings
 */
export default interface EditorTool {
  /**
   * Unique identifier of the tool
   */
  id: string;

  /**
   * User-friendly plugin title
   */
  name: string;

  /**
   * Name of the tool class. Since it's imported globally,
   * we need the class name to properly connect the tool to the editor
   */
  class: string;

  /**
   * Source of the tool to get it's code
   */
  source: {
    /**
     * Tool URL in content delivery network
     */
    cdn?: string;
  }
}
