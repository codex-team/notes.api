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
}
