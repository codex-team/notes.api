import User from '@domain/entities/user';
// import type User from '@domain/entities/user';
import type UserStorage from '@repository/storage/user.storage.js';


export default class UserListRepository {

  public storage: UserStorage;

  constructor(storage: UserStorage) {
    this.storage = storage;
  }



  public async getAllUsersById(): Promise<User[]> {
    return await this.storage.getAllUsersById();
  }





}