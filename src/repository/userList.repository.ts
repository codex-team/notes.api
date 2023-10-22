import type UserStorage from '@repository/storage/user.storage.js';
import type User from '@domain/entities/user';


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
   * Gets note list by creator id
   *
   * @returns { Promise<UserList> } user
   */
  public async getAllUsers(): Promise<User[]> {
    return await this.storage.getAllUsers();
  }
}