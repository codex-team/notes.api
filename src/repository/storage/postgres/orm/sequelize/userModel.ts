import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';
import { UserModel } from '@repository/storage/postgres/orm/sequelize/user.js';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';

/**
 * Class representing a table storing Users
 */
export default class UserModelSequelizeStorage {
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
}