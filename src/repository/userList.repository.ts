import type UserStorage from '@repository/storage/user.storage.js';
import type { UserList } from '@domain/entities/userList';


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
  public async getAllUsers(): Promise<UserList> {
    return await this.storage.getAllUsers();
  }
}