import type UserExtensions from '@domain/entities/userExtensions.js';

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
   * Custom plugins from the marketplace that improve
   * editor or notes environment
   */
  extensions?: UserExtensions;
}
