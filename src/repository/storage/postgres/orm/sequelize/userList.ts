import type User from '@domain/entities/user.js';
import type { UserList } from '@domain/entities/userList.js';
import type { UserModel } from '@repository/storage/postgres/orm/sequelize/user.js';
import type UserModelSequelizeStorage from '@repository/storage/postgres/orm/sequelize/userModel.js';

/**
 * Class representing a table storing Users
 */
export default class UserListSequelizeStorage {
  public model: typeof UserModel;

  /**
   *  Constructor for user model storage
   *
   * @param root0 - model instance
   */
  constructor({ model }: UserModelSequelizeStorage) {
    this.model = model;
  }
  /**
   * Gets all users
   *
   * @param offset - number of skipped users
   * @param limit - number of users to get
   * @returns { Promise<UserList> } user
   */
  public async getUserList(offset: number, limit: number): Promise<User[]> {
    return await this.model.findAll({
      offset: offset,
      limit: limit,
    });
  }
}