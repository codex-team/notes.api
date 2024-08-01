import type User from './user.js';

/**
 * Plugin that connects to the editor based on user settings
 */
export default interface EditorTool {
  /**
   * Unique identifier of the tool. Nano-ID
   */
  id: string;

  /**
   * Technical name of the tool, like 'header', 'list', 'linkTool'
   */
  name: string;

  /**
   * User-friendly plugin title
   */
  title: string;

  /**
   * Name of the tool class. Since it's imported globally,
   * we need the class name to properly connect the tool to the editor
   */
  exportName: string;

  /**
   * Description of the tool. It's shown in the marketplace
   */
  description?: string;

  /**
   * S3 key to the tool cover image
   */
  cover?: string;

  /**
   * User id that added the tool to the marketplace
   */
  userId: User['id'] | null;

  /**
   * Is plugin included by default in the editor
   */
  isDefault?: boolean;

  /**
   * Source of the tool to get it's code
   */
  source: {
    /**
     * Tool URL in content delivery network
     */
    cdn?: string;
  };
}

/**
 * Editor tool creation attributes
 */
export type EditorToolCreationAttributes = Omit<EditorTool, 'id'>;
