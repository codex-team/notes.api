import type User from '@domain/entities/user.js';
import type { UserList } from '@domain/entities/userList.js';
import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';
import { UserModel } from '@repository/storage/postgres/orm/sequelize/user.js';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';

/**
 * Class representing a table storing Users
 */
export default class UserListSequelizeStorage {
  /**
   * User model in database
   */
  public model: typeof UserModel;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'users';

  /**
   * Constructor for user storage
   *
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate user model
     */
    this.model = UserModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      photo: {
        type: DataTypes.STRING,
      },
      editorTools: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      timestamps: false,
    });
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