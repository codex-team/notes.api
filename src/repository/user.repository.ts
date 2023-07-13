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
    return await this.storage.insertUser(email);
  }

  /**
   * Get user
   *
   * @param user - user to get
   * @returns { Promise<User | null> } found user
   */
  public async getUser({ id, email }: User): Promise<User | null> {
    let foundUser;

    /**
     * Check if id or email was provided
     */
    if (id) {
      foundUser = await this.storage.getUserById(id);
    } else {
      foundUser = await this.storage.getUserByEmail(email);
    }

    return foundUser;
  }
}
