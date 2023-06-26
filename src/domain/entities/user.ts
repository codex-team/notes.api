/**
 * User entity
 */
export default class User {
  /**
   * User id
   */
  public id: number;

  /**
   * User email address
   */
  public email: string;

  /**
   * User entity constructor
   *
   * @param email - user email address
   * @param id - user id
   */
  constructor(email = '', id = 0) {
    this.email = email;
    this.id = id;
  }
}
