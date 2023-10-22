import type UserStorage from '@repository/storage/user.storage.js';
import type User from '@domain/entities/user';


/**
 * Repository allows accessing data from business-logic (domain) level
 */
export default class UserListRepository {
  public storage: UserStorage;
  /**
   * create userList repository instance
   *
   * @param storage - user storage
   */
  constructor(storage: UserStorage) {
    this.storage = storage;
  }

  /**
   * Get all users
   */
  public async getAllUsers(): Promise<User[]> {
    return await this.storage.getAllUsers();
  }
}