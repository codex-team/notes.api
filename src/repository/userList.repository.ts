import type User from '@domain/entities/user.js';
import type UserListStorage from '@repository/storage/userList.storage.js';

/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class UserListRepository {
  /**
   * User list storage instance
   */
  public storage: UserListStorage;

  /**
   * User list repository constructor
   *
   * @param storage - storage for user list
   */
  constructor(storage: UserListStorage) {
    this.storage = storage;
  }

  /**
   * Gets all users
   *
   * @param offset - number of skipped notes
   * @param limit - number of notes to get
   */
  public async getUserList(offset: number, limit: number): Promise<User[]> {
    return await this.storage.getUserList(offset, limit);
  }
}
