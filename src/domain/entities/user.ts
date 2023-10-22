import type EditorTool from './editorTools';

/**
 * User entity
 */
export default interface User {
  /**
   * User id
   */
  id: number;

  /**
   * User email
   */
  email: string;

  /**
   * User name
   */
  name: string;

  /**
   * User created at
   */
  createdAt?: Date;

  /**
   * User photo
   */
  photo?: string;

  /**
   * Custom plugins ids from the marketplace that improve editor or notes environment
   */
  editorTools?: EditorTool['id'][];
}
