import type User from '@domain/entities/user.js';
import type { UserList } from '@domain/entities/userList.js';
import type { UserModel } from '@repository/storage/postgres/orm/sequelize/userModel.js';
import type UserModelSequelizeStorage from '@repository/storage/postgres/orm/sequelize/userModel.js';

/**
 * Class representing a functions of model userList
 */
export default class UserListSequelizeStorage {
  public model: typeof UserModel;

  /**
   *  Constructor for user model storage
   *
   * @param model - user model instance
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