import UserStorage from '@repository/storage/user.storage.js';
import User from '@domain/entities/user.js';

/**
 * User repository
 */
export default class UserRepository {
  /**
   * User storage
   */
  public storage: UserStorage;

  /**
   * User repository constructor
   *
   * @param storage - user storage
   */
  constructor(storage: UserStorage) {
    this.storage = storage;
  }

  /**
   * Add user
   *
   * @param email - user email address
   * @returns { Promise<User> } added user
   */
  public async addUser({ email }: User): Promise<User> {
    const insertedUser = await this.storage.insertUser(email);

    return new User(insertedUser.email, insertedUser.id);
  }

  /**
   * Get user
   *
   * @param user - user to get
   * @returns { Promise<User | undefined> } found user
   */
  public async getUser({ id, email }: User): Promise<User | undefined> {
    let foundUser;

    /**
     * Check if id or email was provided
     */
    if (id) {
      foundUser = await this.storage.getUserById(id);
    } else {
      foundUser = await this.storage.getUserByEmail(email);
    }

    /**
     * Check if user was found
     */
    if (!foundUser) {
      return;
    }

    return new User(foundUser.email, foundUser.id);
  }
}
