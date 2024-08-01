import type { MultipartFields, MultipartFile, MultipartValue } from '@fastify/multipart';

/**
 * Represents the data transfer object for adding an editor tool.
 */
export interface AddEditorToolDto extends MultipartFields {
  /**
   * The name of the editor tool.
   */
  name: MultipartValue<string>;

  /**
   * The title of the editor tool.
   */
  title: MultipartValue<string>;

  /**
   * The export name of the editor tool.
   */
  exportName: MultipartValue<string>;

  /**
   * The description of the editor tool.
   */
  description: MultipartValue<string>;

  /**
   * The source code CDN link of the editor tool.
   */
  source: MultipartValue<string>;

  /**
   * Indicates if the editor tool is the default tool.
   */
  isDefault?: MultipartValue<boolean>;

  /**
   * The cover image of the editor tool.
   */
  cover?: MultipartFile;

  /**
   * The user ID associated with the editor tool.
   */
  userId: MultipartValue<number>;
}
