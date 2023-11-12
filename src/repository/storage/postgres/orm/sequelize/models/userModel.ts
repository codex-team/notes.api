import type { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Model } from 'sequelize';
import type User from '@domain/entities/user.js';


/**
 * Class representing a user model in database
 */
export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  /**
   * User id
   */
  public declare id: CreationOptional<number>;

  /**
   * User email address
   */
  public declare email: string;

  /**
   * User name
   */
  public declare name: string;

  /**
   * User created at
   */
  public declare createdAt: Date;

  /**
   * User photo
   */
  public declare photo: CreationOptional<string>;

  /**
   * List of tools ids installed by user from Marketplace
   */
  public declare editorTools: CreationOptional<User['editorTools']>;
}

/**
 * Class representing a table storing Users
 */
export default class UserModelSequelize {
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