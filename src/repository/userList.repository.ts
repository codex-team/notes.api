import type User from '@domain/entities/user';
import type UserStorage from '@repository/storage/user.storage.js';


/**
 *
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
   *
   */
  public async getAllUsers(): Promise<User[]> {
    return await this.storage.getAllUsers();
  }
}